import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthUserID } from "../types/common";
import { jwtSecret } from "../config";

interface Auth {
	user: AuthUserID;
}

type RequestWithAuthHandler = (req: RequestWithAuth, res: Response, next: NextFunction) => Promise<any>;

export type RequestWithAuth = Request & Auth;

export default function privateAsyncHandler(handler: RequestWithAuthHandler) {
	return async (req: Request, res: Response, next: NextFunction) => {
		const authHeader = req.headers.authorization;

		if (authHeader == null) {
			res.status(401).json({ error: "No token provided"});

			return;
		}

		const token = authHeader.split("Bearer ")[1];
		let user: AuthUserID;

		try {
			// TODO: Check following line
			user = jwt.verify(token, jwtSecret) as AuthUserID;
		} catch (err) {
			res.status(401).json({ error: "Invalid token"});

			return;
		}

		try {
			await handler(Object.assign(req, { user }), res, next);
		} catch (err) {
			next(err);
		}
	};
}
