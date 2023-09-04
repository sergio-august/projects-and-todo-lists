import { useNavigate } from "react-router";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import useAppStore from "../stores/useAppStore.js";

export default function Header() {
	const navigate = useNavigate();
	const user = useAppStore((store) => store.user);
	const logout = useAppStore((store) => store.logout);

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	return (
		<Box sx={{ flexGrow: 1 }}>
			<AppBar position="static">
				<Toolbar>
					<Typography
						variant="h6"
						onClick={handleLogout}
						style={{ cursor: "pointer" }}
						sx={{ flexGrow: 1 }}
					>
						Projects & Todo lists
					</Typography>
					{user
						? [
								<Typography key={0} style={{ paddingRight: 8 }}>
									Hi, {user.fullName}
								</Typography>,
								<Button key={1} variant="contained" onClick={handleLogout}>
									Logout
								</Button>,
						  ]
						: [
								window.location.pathname !== "/login" && (
									<Button
										key={0}
										color="inherit"
										onClick={() => navigate("/login")}
									>
										Login
									</Button>
								),
								window.location.pathname !== "/signup" && (
									<Button
										key={1}
										color="inherit"
										onClick={() => navigate("/signup")}
									>
										Signup
									</Button>
								),
						  ]}
				</Toolbar>
			</AppBar>
		</Box>
	);
}
