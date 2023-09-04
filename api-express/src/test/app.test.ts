import crypto from "crypto";
import chai from "chai";
import chaiHttp from "chai-http";
import { Project, Task, Prisma } from "@prisma/client";
import createApp from "../app";
import prisma from "../prisma";

/*
	Todo:

	- implement permissions fail tests
*/

const app = createApp({ urlPrefix: "" });
chai.use(chaiHttp);
const expect = chai.expect;

const TestUserCredentials: Prisma.UserCreateInput = {
	fullName: "John Silva",
	email: "test@example.com",
	password: "password",
};

describe("User Registration", () => {
	before(async () => {
		await prisma.user.deleteMany();
	});

	it("should create a new user", async () => {
		const res = await chai
			.request(app)
			.post("/register")
			.send(TestUserCredentials);

		expect(res).to.have.status(200);
		expect(res.body).to.have.property("id");
	});
});

describe("User Authentication", () => {
	it("should authenticate a user with valid credentials", async () => {
		const res = await chai
			.request(app)
			.post("/login")
			.send(TestUserCredentials);

		expect(res).to.have.status(200);
		expect(res.body).to.have.property("token");
		expect(res.body).to.have.property("fullName");
	});

	it("should not authenticate a user with invalid credentials", async () => {
		const res = await chai
			.request(app)
			.post("/login")
			.send({ ...TestUserCredentials, password: crypto.randomUUID() });

		expect(res).to.have.status(401);
		expect(res.body).to.have.property("error");
		expect(res.body.error).to.equal("Invalid credentials");
	});
});

describe("Projects", () => {
	let token: string;
	const testProjects: Project[] = [];

	before(async () => {
		const res = await chai
			.request(app)
			.post("/login")
			.send(TestUserCredentials);

		token = res.body.token;
	});

	it("should create a new project for an authenticated user", async () => {
		const res = await chai
			.request(app)
			.post("/projects")
			.set("Authorization", `Bearer ${token}`)
			.send({ name: "Test Project" });

		expect(res).to.have.status(200);
		expect(res.body).to.have.property("id");
		expect(res.body.name).to.equal("Test Project");

		testProjects.push(res.body);
	});

	it("should return a list of projects for an authenticated user", async () => {
		const res = await chai
			.request(app)
			.get("/projects")
			.set("Authorization", `Bearer ${token}`);

		expect(res).to.have.status(200);
		expect(res.body).to.be.an("array").and.have.lengthOf(testProjects.length);
	});

	it("should update an existing project for an authenticated user", async () => {
		const id = testProjects[0].id;

		const res = await chai
			.request(app)
			.patch(`/projects/${id}`)
			.set("Authorization", `Bearer ${token}`)
			.send({ name: "Updated Project" });

		expect(res).to.have.status(200);
		expect(res.body).to.have.property("id");
		expect(res.body.name).to.equal("Updated Project");
	});

	it("should fail to update a non-existing project for an authenticated user", async () => {
		const id = Date.now();

		const res = await chai
			.request(app)
			.patch(`/projects/${id}}`)
			.set("Authorization", `Bearer ${token}`)
			.send({ name: "Updated Project" });

		expect(res).to.have.status(404);
	});

	it("should delete an existing project for an authenticated user", async () => {
		const id = testProjects[0].id;

		const res = await chai
			.request(app)
			.delete(`/projects/${id}`)
			.set("Authorization", `Bearer ${token}`);

		expect(res).to.have.status(204);

		testProjects.shift();
	});
});

describe("Tasks", () => {
	let token: string;
	let projectId: number;
	const tasks: Task[] = [];
	let deletedId: number;

	before(async () => {
		const loginResponse = await chai
			.request(app)
			.post("/login")
			.send(TestUserCredentials);

		token = loginResponse.body.token;

		const projectsResponse = await chai
			.request(app)
			.post("/projects")
			.set("Authorization", `Bearer ${token}`)
			.send({ name: "Tasks" });

		projectId = projectsResponse.body.id;
	});

	it("should create a new task for a project", async () => {
		const res = await chai
			.request(app)
			.post(`/projects/${projectId}/tasks`)
			.set("Authorization", `Bearer ${token}`)
			.send({ description: "Test Task" });

		expect(res).to.have.status(200);
		expect(res.body).to.have.property("id");
		expect(res.body.description).to.equal("Test Task");

		tasks.push(res.body);
	});

	it("should return a list of tasks for a project", async () => {
		const res = await chai
			.request(app)
			.get(`/projects/${projectId}/tasks`)
			.set("Authorization", `Bearer ${token}`);

		expect(res).to.have.status(200);
		expect(res.body).to.be.an("array").and.have.a.lengthOf(tasks.length);
	});

	it("should update an existing task for an authenticated user", async () => {
		const updatePayload = {
			description: `${tasks[0].description} ${Date.now()}`,
		};

		const expectedResult = {
			...tasks[0],
			...updatePayload,
		};

		const expectedResultJson = JSON.parse(JSON.stringify(expectedResult));

		const res = await chai
			.request(app)
			.patch(`/tasks/${expectedResult.id}`)
			.set("Authorization", `Bearer ${token}`)
			.send(updatePayload);

		expect(res).to.have.status(200);
		expect(res.body).to.deep.equal(expectedResultJson);

		tasks.splice(0, 1, expectedResult)
	});

	it("should update task status (mark as done) for an authenticated user", async () => {
		const task = tasks[0];

		const res = await chai
			.request(app)
			.put(`/tasks/${task.id}/status`)
			.set("Authorization", `Bearer ${token}`)
			.send({ done: true });

		expect(res).to.have.status(200);
		expect(res.body).to.have.property("finishedAt").and.not.equal(null);
		expect(res.body).to.deep.equal({ ...task, finishedAt: res.body.finishedAt });

		tasks.splice(0, 1, res.body)
	});

	it("should fail to update restricted task property for an authenticated user", async () => {
		const id = Date.now();

		const res = await chai
			.request(app)
			.patch(`/tasks/${id}`)
			.set("Authorization", `Bearer ${token}`)
			.send({ finishedAt: new Date() });

		expect(res).to.have.status(400);
	});

	it("should fail to update non-existing task for an authenticated user", async () => {
		const id = Date.now();

		const res = await chai
			.request(app)
			.patch(`/tasks/${id}`)
			.set("Authorization", `Bearer ${token}`)
			.send({ description: "Updated Task" });

		expect(res).to.have.status(404);
	});

	it("should delete an existing task for an authenticated user", async () => {
		const id = tasks[0].id

		const res = await chai
			.request(app)
			.delete(`/tasks/${id}`)
			.set("Authorization", `Bearer ${token}`);

		expect(res).to.have.status(204);

		deletedId = id;
		tasks.shift();
	});

	it("should delete already deleted task for an authenticated user", async () => {
		const id = deletedId

		const res = await chai
			.request(app)
			.delete(`/tasks/${id}`)
			.set("Authorization", `Bearer ${token}`);

		expect(res).to.have.status(204);
	});
});
