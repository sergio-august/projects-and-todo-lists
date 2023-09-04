import createApp from "./app";
import { apiUrlPrefix, serverPort } from "./config";

launchServer();

async function launchServer() {
	const app = createApp({ urlPrefix: apiUrlPrefix });

	const server = app.listen(serverPort, () => {
		console.log(`Server is running on http://localhost:${serverPort}${apiUrlPrefix}`);
	});

	process.on("SIGTERM", () => {
		console.debug("SIGTERM signal received: closing HTTP server");

		server.close(() => {
			console.debug("HTTP server closed");
		});
	});

	process.on("SIGINT", function () {
		console.debug("SIGTERM signal received: terminating process");

		process.exit(0);
	});

	process.on("uncaughtException", (err) => {
		console.error(err);
	});
}
