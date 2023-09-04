import Typography from "@mui/material/Typography";

/**
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {string} props.subtitle
 * @param {string} props.typeTitle
 * @param {string} props.typeSubtitle
 */
const TextBlock = ({
	title,
	subtitle,
	typeTitle = "h4",
	typeSubtitle = "subtitle1",
}) => [
	<Typography key={0} variant={typeTitle}>
		{title}
	</Typography>,
	<Typography key={1} variant={typeSubtitle}>
		{subtitle}
	</Typography>,
];

export default TextBlock;
