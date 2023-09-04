import type { Request, Response, NextFunction } from "express";

export default function asyncHandler(
	handler: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			await handler(req, res, next);
		} catch (err) {
			next(err);
		}
	};
}
