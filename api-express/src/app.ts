import express from "express";
import jwt from "jsonwebtoken";
import * as z from "zod";
import prisma from "./prisma";
import asyncHandler from "./middleware/async-handler";
import privateAsyncHandler from "./middleware/private-async-handler";
import { jwtSecret } from "./config";
import validate from "./middleware/validate";
import errorHandler from "./middleware/error-handler";

/*
	Todo:

	- Add missing payload validations
	- Hash passwords (bcrypt, salt)
	- Add Helmet, setup CORS
	- Extract controllers/routes/models
	- Make adjustable path prefix
	- Refactor error handling
	- Add failing tests
	- Setup logging
	- Setup CI/CD
*/

const idSchema = z.coerce.number().int().min(1);

const registerSchema = z.object({
	body: z
		.object({
			email: z
				.string({
					required_error: "Email is required",
				})
				.email("Not a valid email"),
			fullName: z.string({
				required_error: "Full name is required",
			}),
			password: z
				.string({
					required_error: "Password is required",
				})
				.min(8, "Password must be at least 8 characters long"),
		})
		.strict(),
});

const loginSchema = z.object({
	body: z
		.object({
			email: z
				.string({
					required_error: "Email is required",
				})
				.email("Not a valid email"),
			password: z
				.string({
					required_error: "Password is required",
				})
				.min(8, "Password must be at least 8 characters long"),
		})
		.strict(),
});

const postProjectSchema = z.object({
	body: z
		.object({
			name: z.string().min(5).max(256),
		})
		.strict(),
});

const postProjectTasksSchema = z.object({
	params: z.object({
		projectId: idSchema,
	}),
	body: z
		.object({
			description: z.string().min(1).max(256),
		})
		.strict(),
});

const patchTaskSchema = z.object({
	params: z.object({
		id: idSchema,
	}),
	body: z
		.object({
			description: z.string().min(1).max(256).optional(),
		})
		.strict(),
});

const setTaskStatusSchema = z.object({
	params: z.object({
		id: idSchema,
	}),
	body: z
		.object({
			done: z.boolean(),
		})
		.strict(),
});

export default function createApp({ urlPrefix }: { urlPrefix?: string } = {}) {
	const app = express();

	app.use(express.json());

	// User Registration
	app.post(
		"/register",
		validate(registerSchema),
		asyncHandler(async (req, res) => {
			const { email, fullName, password } = (
				req as z.infer<typeof registerSchema>
			).body;

			const user = await prisma.user.create({
				data: { email: String(email).toLowerCase(), fullName, password }, // Todo: Hash password
			});

			res.json({ id: user.id });
		}),
	);

	// User Authentication
	app.post(
		"/login",
		validate(loginSchema),
		asyncHandler(async (req, res) => {
			const { email, password } = req.body;

			const user = await prisma.user.findUnique({
				where: { email: String(email).toLowerCase() },
			});

			if (user != null && user.password === password) {
				// Todo: Hash password
				const token = jwt.sign({ userId: user.id }, jwtSecret);

				res.json({
					token,
					fullName: user.fullName,
					id: user.id,
				});
			} else {
				res.status(401).json({ error: "Invalid credentials" });
			}
		}),
	);

	// Projects
	app.get(
		"/projects",
		privateAsyncHandler(async (req, res) => {
			const projects = await prisma.project.findMany({
				where: { userId: req.user.userId },
				include: { tasks: true },
			});

			res.json(projects);
		}),
	);

	app.post(
		"/projects",
		validate(postProjectSchema),
		privateAsyncHandler(async (req, res) => {
			const project = await prisma.project.create({
				data: { ...req.body, userId: req.user.userId },
				include: { tasks: true },
			});

			res.json(project);
		}),
	);

	app.patch(
		"/projects/:id",
		privateAsyncHandler(async (req, res) => {
			const project = await prisma.project.update({
				where: {
					id: parseInt(req.params.id),
					userId: req.user.userId,
				},
				data: req.body,
				include: { tasks: true },
			});

			res.json(project);
		}),
	);

	app.delete(
		"/projects/:id",
		privateAsyncHandler(async (req, res) => {
			const _project = await prisma.project.delete({
				where: { id: parseInt(req.params.id), userId: req.user.userId },
			});

			res.sendStatus(204);
		}),
	);

	// Tasks
	app.get(
		"/projects/:projectId/tasks",
		privateAsyncHandler(async (req, res) => {
			const tasks = await prisma.task.findMany({
				where: { projectId: parseInt(req.params.projectId) },
			});

			res.json(tasks);
		}),
	);

	app.post(
		"/projects/:projectId/tasks",
		validate(postProjectTasksSchema),
		privateAsyncHandler(async (req, res) => {
			const project = await prisma.project.findUnique({
				where: { id: parseInt(req.params.projectId) },
			});

			if (project == null) {
				res.status(404).send("Project not found");

				return;
			}

			// Todo: Refactor to guard
			if (project.userId !== req.user.userId) {
				res.status(403).send(
					"You are not allowed to create task for this project",
				);

				return;
			}

			const task = await prisma.task.create({
				data: {
					...req.body,
					projectId: parseInt(req.params.projectId),
				},
			});

			res.json(task);
		}),
	);

	app.patch(
		"/tasks/:id",
		validate(patchTaskSchema),
		privateAsyncHandler(async (req, res) => {
			const task = await prisma.task.update({
				data: req.body,
				where: {
					id: parseInt(req.params.id),
					project: { userId: req.user.userId },
				},
			});

			res.json(task);
		}),
	);

	app.put(
		"/tasks/:id/status",
		validate(setTaskStatusSchema),
		privateAsyncHandler(async (req, res) => {
			const finishedAt = req.body.done === true ? new Date() : null;

			const task = await prisma.task.update({
				data: { finishedAt },
				where: {
					id: parseInt(req.params.id),
					project: { userId: req.user.userId },
				},
			});

			res.json(task);
		}),
	);

	app.delete(
		"/tasks/:id",
		privateAsyncHandler(async (req, res) => {
			await prisma.task.delete({
				where: {
					id: parseInt(req.params.id),
					project: { userId: req.user.userId },
				},
			});

			res.sendStatus(204);
		}),
	);

	app.use(errorHandler);

	if (typeof urlPrefix !== "string" || urlPrefix === "") {
		return app;
	}

	const prefixedApp = express();
	prefixedApp.use(urlPrefix, app);

	return prefixedApp;
}
