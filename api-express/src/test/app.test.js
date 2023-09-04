"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const chai_1 = __importDefault(require("chai"));
const chai_http_1 = __importDefault(require("chai-http"));
const app_1 = __importDefault(require("../src/app"));
const prisma_1 = __importDefault(require("../src/prisma"));
/*
    Todo:

    - implement permissions fail tests
*/
chai_1.default.use(chai_http_1.default);
const expect = chai_1.default.expect;
const TestUserCredentials = {
    fullName: "John Silva",
    email: "test@example.com",
    password: "password",
};
describe("User Registration", () => {
    before(async () => {
        await prisma_1.default.user.deleteMany();
    });
    it("should create a new user", async () => {
        const res = await chai_1.default
            .request(app_1.default)
            .post("/register")
            .send(TestUserCredentials);
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("id");
    });
});
describe("User Authentication", () => {
    it("should authenticate a user with valid credentials", async () => {
        const res = await chai_1.default
            .request(app_1.default)
            .post("/login")
            .send(TestUserCredentials);
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("token");
    });
    it("should not authenticate a user with invalid credentials", async () => {
        const res = await chai_1.default
            .request(app_1.default)
            .post("/login")
            .send({ ...TestUserCredentials, password: crypto_1.default.randomUUID() });
        expect(res).to.have.status(401);
        expect(res.body).to.have.property("error");
        expect(res.body.error).to.equal("Invalid credentials");
    });
});
describe("Projects", () => {
    let token;
    const testProjects = [];
    before(async () => {
        const res = await chai_1.default
            .request(app_1.default)
            .post("/login")
            .send(TestUserCredentials);
        token = res.body.token;
    });
    it("should create a new project for an authenticated user", async () => {
        const res = await chai_1.default
            .request(app_1.default)
            .post("/projects")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Test Project" });
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("id");
        expect(res.body.name).to.equal("Test Project");
        testProjects.push(res.body);
    });
    it("should return a list of projects for an authenticated user", async () => {
        const res = await chai_1.default
            .request(app_1.default)
            .get("/projects")
            .set("Authorization", `Bearer ${token}`);
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array").and.have.lengthOf(testProjects.length);
    });
    it("should update an existing project for an authenticated user", async () => {
        const id = testProjects[0].id;
        const res = await chai_1.default
            .request(app_1.default)
            .patch(`/projects/${id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Updated Project" });
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("id");
        expect(res.body.name).to.equal("Updated Project");
    });
    it("should fail to update a non-existing project for an authenticated user", async () => {
        const id = Date.now();
        const res = await chai_1.default
            .request(app_1.default)
            .patch(`/projects/${id}}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Updated Project" });
        expect(res).to.have.status(404);
    });
    it("should delete an existing project for an authenticated user", async () => {
        const id = testProjects[0].id;
        const res = await chai_1.default
            .request(app_1.default)
            .delete(`/projects/${id}`)
            .set("Authorization", `Bearer ${token}`);
        expect(res).to.have.status(204);
        testProjects.shift();
    });
});
describe("Tasks", () => {
    let token;
    let projectId;
    const tasks = [];
    let deletedId;
    before(async () => {
        const loginResponse = await chai_1.default
            .request(app_1.default)
            .post("/login")
            .send(TestUserCredentials);
        token = loginResponse.body.token;
        const projectsResponse = await chai_1.default
            .request(app_1.default)
            .post("/projects")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Tasks" });
        projectId = projectsResponse.body.id;
    });
    it("should create a new task for a project", async () => {
        const res = await chai_1.default
            .request(app_1.default)
            .post(`/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({ description: "Test Task" });
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("id");
        expect(res.body.description).to.equal("Test Task");
        tasks.push(res.body);
    });
    it("should return a list of tasks for a project", async () => {
        const res = await chai_1.default
            .request(app_1.default)
            .get(`/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`);
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array").and.have.a.lengthOf(tasks.length);
    });
    it("should update an existing task for an authenticated user", async () => {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 1);
        const updatePayload = {
            description: `${tasks[0].description} ${Date.now()}`,
            dueDate: dueDate,
        };
        const expectedResult = {
            ...tasks[0],
            ...updatePayload,
        };
        const expectedResultJson = JSON.parse(JSON.stringify(expectedResult));
        const res = await chai_1.default
            .request(app_1.default)
            .patch(`/tasks/${expectedResult.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send(updatePayload);
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal(expectedResultJson);
        tasks.splice(0, 1, expectedResult);
    });
    it("should fail to update non-existing task for an authenticated user", async () => {
        const id = Date.now();
        const res = await chai_1.default
            .request(app_1.default)
            .patch(`/tasks/${id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ dueDate: new Date() });
        expect(res).to.have.status(404);
    });
    it("should delete an existing task for an authenticated user", async () => {
        const id = tasks[0].id;
        const res = await chai_1.default
            .request(app_1.default)
            .delete(`/tasks/${id}`)
            .set("Authorization", `Bearer ${token}`);
        expect(res).to.have.status(204);
        deletedId = id;
        tasks.shift();
    });
    it("should delete already deleted task for an authenticated user", async () => {
        const id = deletedId;
        const res = await chai_1.default
            .request(app_1.default)
            .delete(`/tasks/${id}`)
            .set("Authorization", `Bearer ${token}`);
        expect(res).to.have.status(204);
    });
});
//# sourceMappingURL=app.test.js.map