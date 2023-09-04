import { useState } from "react";
import { useNavigate } from "react-router";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import useAppStore from "../stores/useAppStore";

export default function SignUp() {
	const [email, setEmail] = useState("");
	const [fullName, setFullName] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const navigate = useNavigate();
	const register = useAppStore((store) => store.register);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			await register({ email, password, fullName });

			navigate("/login");
		} catch (error) {
			console.error(error);

			if (error instanceof Error) setError(error?.message ?? "Something went wrong!");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container maxWidth="xs">
			<Typography variant="h4" align="center" style={{ marginBottom: "20px" }}>
				Sign Up
			</Typography>
			<form onSubmit={handleSubmit}>
				<TextField
					label="Full Name"
					variant="outlined"
					fullWidth
					margin="normal"
					value={fullName}
					onChange={(e) => setFullName(e.target.value)}
					required
				/>
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
					{loading ? <CircularProgress size={24} /> : "Sign Up"}
				</Button>
			</form>
		</Container>
	);
}
