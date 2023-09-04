import { useState } from "react";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import TaskListItem from "./TaskListItem.jsx";
import PropTypes from "prop-types";
import useAppStore from "../stores/useAppStore.js";

const listStyle = {
	width: "100%",
	backgroundColor: "#ffffff",
};

TasksList.propTypes = {
	project: PropTypes.object.isRequired,
};

/**
 * TasksList component
 * @param {Object} props
 * @param {Api.ProjectOutput} props.project
 */
export default function TasksList({ project }) {
	const [addTask, markTaskDone, deleteTask] = useAppStore((store) => [
		store.addTask,
		store.markTaskDone,
		store.deleteTask,
	]);

	const [description, setDescription] = useState("");

	/**
	 * Add task to specific project
	 */
	const handleAddTask = async () => {
		await addTask({ projectId: project.id, description });
		setDescription("");
	};

	const handleKeyDown = (event) => {
		if (event.key === "Enter") {
			handleAddTask();
		}
	};

	const renderTasks = ({ finished } = {}) => {
		if (project.tasks?.length === 0 && finished !== true) {
			return (
				<ListItem disabled={true} dense button>
					<ListItemText id={1} primary="Currently there is no tasks" />
				</ListItem>
			);
		}

		const filteredTasks = project.tasks?.filter((task) => {
			const taskCompleted = task.finishedAt != null;

			return finished === taskCompleted;
		});

		return filteredTasks.map((task) => (
			<TaskListItem
				key={task.id}
				task={task}
				onCheck={() => markTaskDone({ id: task.id, done: !task.finishedAt })}
				onDelete={() => deleteTask(task)}
			/>
		));
	};

	return (
		<List style={listStyle}>
			{renderTasks({ finished: false })}
			<Divider />
			{renderTasks({ finished: true })}
			<Divider />
			<div style={{ padding: "12px 12px", display: "flex" }}>
				<TextField
					id={`text-description-${project.id}`}
					label="Description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					onKeyDown={handleKeyDown}
				/>

				<Button color="primary" size="small" onClick={handleAddTask}>
					Add Task
				</Button>
			</div>
		</List>
	);
}
