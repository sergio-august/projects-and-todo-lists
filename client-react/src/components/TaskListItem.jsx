import Checkbox from "@mui/material/Checkbox";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import PropTypes from "prop-types";

TaskListItem.propTypes = {
	task: PropTypes.object.isRequired,
	onCheck: PropTypes.func.isRequired,
	onDelete: PropTypes.func.isRequired,
};

/**
 * TaskListItem component
 * @param {Object} props
 * @param {Api.TaskOutput} props.task
 * @param {Function} props.onCheck
 * @param {Function} props.onDelete
 */
export default function TaskListItem({ task, onCheck, onDelete }) {
	const checkboxId = `checkbox-${task.id}`;
	const labelId = `label-${checkboxId}`;
	const finished = task.finishedAt != null;
	const finishDate = finished ? new Date(task.finishedAt).toUTCString() : null;
	const title = finishDate
		? `Finished at ${finishDate}`
		: "Click to mark as completed";

	const handleDelete = (e) => {
		e.stopPropagation();
		onDelete(task);
	};

	return (
		<Tooltip title={title} arrow>
			<ListItemButton key={task.id} onClick={onCheck}>
				<ListItemIcon>
					<Checkbox
						id={checkboxId}
						edge="start"
						checked={finished}
						tabIndex={-1}
						disableRipple
						inputProps={{ "aria-labelledby": labelId }}
					/>
				</ListItemIcon>

				<ListItemText
					id={labelId}
					primary={task.description}
					style={{ textDecoration: finished ? "line-through" : "none" }}
				/>

				<ListItemSecondaryAction>
					<IconButton edge="end" onClick={handleDelete}>
						<DeleteIcon />
					</IconButton>
				</ListItemSecondaryAction>
			</ListItemButton>
		</Tooltip>
	);
}
