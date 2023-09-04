import { useState } from "react";
import { useNavigate } from "react-router";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import useAppStore from "../stores/useAppStore";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const navigate = useNavigate();
	const login = useAppStore((store) => store.login);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			await login({ email, password });

			navigate("/");
		} catch (error) {
			console.error(error);

			setError(error.message ?? "Something went wrong!");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container maxWidth="xs">
			<Typography variant="h4" align="center" style={{ marginBottom: "20px" }}>
				Login
			</Typography>
			<form onSubmit={handleSubmit}>
				<TextField
					label="Email"
					type="email"
					variant="outlined"
					fullWidth
					margin="normal"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
				<TextField
					label="Password"
					type="password"
					variant="outlined"
					fullWidth
					margin="normal"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
				{error && (
					<Typography color="error" style={{ marginBottom: "10px" }}>
						{error}
					</Typography>
				)}
				<Button
					type="submit"
					variant="contained"
					color="primary"
					fullWidth
					disabled={loading}
				>
					{loading ? <CircularProgress size={24} /> : "Login"}
				</Button>
			</form>
		</Container>
	);
}
