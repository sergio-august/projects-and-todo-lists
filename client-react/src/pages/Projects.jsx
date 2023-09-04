import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import TaskList from "../components/TaskList";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useAppStore from "../stores/useAppStore";

export default function Projects() {
	const [projectName, setProjectName] = useState("");
	const [loading, setLoading] = useState(false);

	const user = useAppStore((store) => store.user);
	const projectsById = useAppStore((store) => store.projectsById);
	const [fetchProjectsAndTasks, addProject, editProjectName, deleteProject] =
		useAppStore((store) => [
			store.fetchProjectsAndTasks,
			store.addProject,
			store.editProjectName,
			store.deleteProject,
		]);

	useEffect(() => {
		onGetProjects();
	}, [user]);

	/**
	 * Fetch all projects and tasks of the current user
	 */
	async function onGetProjects() {
		setLoading(true);
		await fetchProjectsAndTasks();
		setLoading(false);
	}

	/**
	 * Create new project
	 */
	const onAddProject = async () => {
		if (projectName.length < 5) {
			Swal.fire(
				"Warning",
				"Project name must be at least 5 characters in length.",
				"warning",
			);

			return;
		}

		try {
			const project = await addProject({ name: projectName });
			Swal.fire(
				"Success!",
				`Project "${project.name}" was successfully created`,
				"success",
			);
			setProjectName("");
		} catch (error) {
			console.error(error);

			Swal.fire(
				"Failure!",
				`Failed with message: "${error.message}", see console for details`,
				"error",
			);
		}
	};

	/**
	 * Update project name
	 */
	const onUpdateProjectName = (projectId) => {
		Swal.fire({
			title: "Edit project name:",
			input: "text",
			showCancelButton: true,
			confirmButtonText: "Save",
			preConfirm: (name) => {
				return editProjectName({ projectId, name }).catch((error) => {
					console.error(error);
					Swal.showValidationMessage(error);
				});
			},
		});
	};

	/**
	 * Delete project by id
	 */
	const onDeleteProject = (projectId) => {
		Swal.fire({
			title: "Delete?",
			text: "Are you sure to delete? You won't be able to revert this!",
			showCancelButton: true,
			confirmButtonText: "Delete",
			preConfirm: () => {
				return deleteProject(projectId).catch((error) => {
					console.error(error);
					Swal.showValidationMessage(error);
				});
			},
		});
	};

	/**
	 * Render projects and their tasks
	 */
	const renderProjects = () => {
		return Object.values(projectsById).map((project) => (
			<Grid key={project.id} item xs={12} sm={6} md={4}>
				<Paper sx={{ padding: 1 }}>
					<Grid
						container
						direction="row"
						alignItems="center"
						justifyContent="space-between"
					>
						<IconButton
							aria-label="Edit"
							edge="end"
							onClick={() => onUpdateProjectName(project.id)}
						>
							<EditIcon />
						</IconButton>

						<Typography variant="h6">{project.name}</Typography>

						<IconButton
							aria-label="Delete"
							edge="end"
							onClick={() => onDeleteProject(project.id)}
						>
							<DeleteIcon />
						</IconButton>
					</Grid>

					<TaskList project={project} />
				</Paper>
			</Grid>
		));
	};

	return (
		<Grid container spacing={{ xs: 2 }}>
			{loading ? (
				<Grid item xs={12} sm={6} md={8}>
					<Grid
						container
						direction="row"
						alignItems="center"
						justifyContent="center"
					>
						<CircularProgress />
					</Grid>
				</Grid>
			) : (
				renderProjects()
			)}

			<Grid item xs={12} sm={6} md={4}>
				<Paper elevation={3} style={{ padding: "40px" }}>
					<Grid
						container
						direction="column"
						spacing={2}
						alignItems="center"
						justifyContent="flex-start"
					>
						<TextField
							id="project-name"
							label="Project Name"
							value={projectName}
							onChange={(e) => setProjectName(e.target.value)}
						/>
						<Button
							color="primary"
							variant="contained"
							size="small"
							onClick={onAddProject}
						>
							Add Project
						</Button>
					</Grid>
				</Paper>
			</Grid>
		</Grid>
	);
}
