/* eslint-disable no-useless-catch */
import { default as axios } from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

axios.defaults.baseURL = "/api";

axios.interceptors.request.use(
	(config) => {
		const token = useAppStore.getState().token;

		if (token) {
			config.headers["Authorization"] = `Bearer ${token}`;
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

axios.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if (error?.response?.status === 401) {
			useAppStore.setState({ token: null, user: null });

			if (window.location.pathname !== "/login") {
				window.location.href = "/login";
			}
		}

		return Promise.reject(error);
	},
);

const appStore = (set) => ({
	/** @type {string | null} */
	token: null,

	/** @type {Api.UserOutput | null} */
	user: null,

	/**
	* Projects including tasks by id
	* @type {Record<string, Api.ProjectOutput>}
	*/
	projectsById: {},

	/**
	 * Register new user
	 * @param {Object} params Named parameters
	 * @param {string} params.email User email
	 * @param {string} params.fullName User full name
	 * @param {string} params.password User password
	 */
	register: async ({ email, fullName, password }) => {
		try {
			const response = await axios.post("/register", {
				email,
				fullName,
				password,
			});

			set({ user: response.data });

			return response.data;
		} catch (error) {
			throw error;
		}
	},

	/**
	 * Login user
	 * @param {Object} params Named parameters
	 * @param {string} params.email User email
	 * @param {string} params.password User password
	 */
	login: async ({ email, password }) => {
		try {
			const response = await axios.post("/login", { email, password });

			if (response.data?.token == null) {
				throw new Error("Invalid response");
			}

			set({
				token: response.data.token,
				user: { email, fullName: response.data.fullName, id: response.data.id },
			});
		} catch (error) {
			throw error;
		}
	},

	logout: () => {
		set({ token: null, user: null })
	},

	fetchProjectsAndTasks: async () => {
		const response = await axios.get("/projects");

		const projectsById = response.data.reduce((acc, project) => {
			acc[project.id] = project;

			return acc;
		}, {});

		set({ projectsById });
	},

	/**
	 * Add new project
	 * @param {Object} params Named parameters
	 * @param {string} params.name Project name
	 * @returns {Promise<Api.ProjectOutput>}
	*/
	addProject: async ({ name }) => {
		const response = await axios.post("/projects", { name });

		set((state) => ({
			projectsById: {
				...state.projectsById,
				[response.data.id]: response.data,
			},
		}));

		return response.data;
	},

	/**
	 * Edit project name
	 * @param {string} projectId Project id
	 * @param {string} name Project name
	 */
	editProjectName: async ({ projectId, name }) => {
		const response = await axios.patch(`/projects/${projectId}`, { name });

		set((state) => ({
			/** @type {Record<string, Api.ProjectOutput>} */
			projectsById: {
				...state.projectsById,
				[response.data.id]: {
					...state.projectsById[response.data.id],
					...response.data,
				},
			},
		}));
	},

	deleteProject: async (projectId) => {
		try {
			await axios.delete(`/projects/${projectId}`);

			const projectIdString = String(projectId);

			set((state) => ({
				/** @type {Record<string, Api.ProjectOutput>} */
				projectsById: Object.fromEntries(
					Object.entries(state.projectsById).filter(
						([pId]) => {
							return pId !== projectIdString
						},
					),
				),
			}));
		} catch (error) {
			throw error;
		}
	},

	/**
	 * Add new task to project
	 * @param {Object} params Named parameters
	 * @param {string} params.projectId Project id
	 * @param {string} params.description Task description
	 * @returns {Promise<Api.TaskOutput>} Resolves with Task object
	 */
	addTask: async ({ projectId, description }) => {
		const response = await axios.post(`/projects/${projectId}/tasks`, {
			description,
		});

		
		set((state) => {
			const project = state.projectsById[projectId];

			const projectsByIdUpdate = project
				? {
						[projectId]: {
							...project,
							tasks: [...project.tasks, response.data],
						},
				  }
				: {};

			return {
				projectsById: {
					...state.projectsById,
					...projectsByIdUpdate,
				},
			};
		});

		return response.data;
	},

	/**
	 * Edit task description
	 * @param {Object} params Named parameters
	 * @param {string} params.id Task id
	 * @param {string} params.description Task description
	*/
	editTask: async ({ id, description }) => {
		const response = await axios.patch(`/tasks/${id}`, { description });

		// Todo...
	},

	/**
	 * Mark task as done
	 * @param {Object} params Named parameters
	 * @param {string} params.id Task id
	 * @param {boolean} params.done Task done status
	 * @returns {Promise<Api.TaskOutput>} Resolves with Task object
	 */
	markTaskDone: async ({ id, done }) => {
		const response = await axios.put(`/tasks/${id}/status`, { done });
		const projectId = response.data.projectId;

		set((state) => ({
			projectsById: {
				...state.projectsById,
				[projectId]: {
					...state.projectsById[projectId],
					tasks: [
						...state.projectsById[projectId].tasks.filter((task) => {
							return task.id !== response.data.id;
						}),
						response.data,
					],
				},
			},
		}));

		return response.data;
	},

	/**
	 * Delete task
	 * @param {Object} params Named parameters
	 * @param {string} params.id Task id
	 * @param {string} params.projectId Project id
	 */
	deleteTask: async ({ projectId, id }) => {
		await axios.delete(`/tasks/${id}`);

		set((state) => ({
			projectsById: {
				...state.projectsById,
				[projectId]: {
					...state.projectsById[projectId],
					tasks: state.projectsById[projectId].tasks.filter(
						(task) => String(task.id) !== String(id),
					),
				},
			},
		}));
	},
});

const useAppStore = create(
	persist(appStore, {
		name: "app-storage",
		partialize: (state) => ({
			token: state.token,
			user: state.user,
		}),
	}),
);

export default useAppStore;
