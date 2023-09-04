
import type { ErrorRequestHandler } from "express";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { HttpException } from "../utils/http-exception";

const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
	if (err instanceof HttpException) {
		res.status(err.status).send(err.message);

		return;
	}

	if (
		// Todo: enhance Prisma error handling
		err instanceof PrismaClientKnownRequestError &&
		err.code === "P2025" // 'Record to update not found.'
	) {
		const httpCode = req.method === "DELETE" ? 204 : 404;

		res.sendStatus(httpCode);

		return;
	}

	console.error(err.stack);
	res.status(500).send("Something broke!");

	return;
};

export default errorHandler;
