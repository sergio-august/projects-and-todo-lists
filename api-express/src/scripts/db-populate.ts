import { faker } from "@faker-js/faker";
import prisma from "../prisma";

type Task = {
	id: number;
	description: string;
	createdAt: Date;
	finishedAt: Date | null;
	projectId: number;
};

type User = {
	id: number;
	email: string;
	fullName: string;
	password: string;
};

type Project = {
	id: number;
	name: string;
	userId: number;
};

async function main() {
	const users: User[] = [];
	const projects: Project[] = [];
	const tasks: Task[] = [];

	// Create two users
	for (let i = 0; i < 2; i++) {
		const email = faker.internet.email().toLowerCase();
		const fullName = faker.person.fullName();
		const password = faker.internet.password();

		const newUser = await prisma.user.create({
			data: {
				email,
				fullName,
				password,
			},
		});

		console.log(
			`\nCreated new user: ${newUser.fullName} (${newUser.email}, ${newUser.password})`,
		);
		users.push(newUser);

		// Create two projects for each user
		for (let j = 0; j < 2; j++) {
			const name = faker.lorem.words(2);

			const newProject = await prisma.project.create({
				data: {
					name,
					userId: newUser.id,
				},
			});

			console.log(`  |__ Created new project: ${newProject.name}`);
			projects.push(newProject);

			// Create three tasks for each project
			for (let k = 0; k < 3; k++) {
				const description = faker.lorem.words(3);
				const finishedAt = k === 0 ? new Date() : null;

				const newTask = await prisma.task.create({
					data: {
						description,
						projectId: newProject.id,
						finishedAt,
					},
				});

				tasks.push(newTask);
			}
		}
	}
}

main()
	.catch((e) => {
		throw e;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
