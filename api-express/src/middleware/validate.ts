import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";
import { RequestWithAuth } from "./private-async-handler";

const validate =
	(schema: AnyZodObject) =>
	async (
		req: Request | RequestWithAuth,
		res: Response,
		next: NextFunction
	) => {
		try {
			await schema.parseAsync({
				body: req.body,
				query: req.query,
				params: req.params,
			});

			return next();
		} catch (e: any) {
			// FIXME:
			return res.status(400).json({ ...e, error: "Incorrect input" });
		}
	};

export default validate;
