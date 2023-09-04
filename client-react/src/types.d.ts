namespace Api {
	interface TaskOutput {
		id: number;
		description: string;
		createdAt: Date;
		finishedAt: Date | null;
		projectId: number;
	}

	interface UserOutput {
		id: number;
		email: string;
		fullName: string;
	}

	interface ProjectOutput {
		id: number;
		name: string;
		userId: number;
		tasks: TaskOutput[];
	}
}
