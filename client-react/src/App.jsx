import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { colors } from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Projects from "./pages/Projects";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Header from "./components/Header";

const theme = createTheme({
	palette: {
		primary: {
			main: "#1976d2",
		},
		secondary: {
			main: colors.grey[700],
		},
	},
});

function App() {
	return (
		<ThemeProvider theme={theme}>
			<Router>
				<Header />
				<Container fixed style={{ paddingTop: "32px" }}>
					<Routes>
						<Route path="/" element={<Projects />} />
						<Route path="/login" element={<Login />} />
						<Route path="/signup" element={<SignUp />} />
					</Routes>
				</Container>
			</Router>
		</ThemeProvider>
	);
}

export default App;
