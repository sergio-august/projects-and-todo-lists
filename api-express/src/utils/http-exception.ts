/**
 * HTTP Exception Base class
 */
export class HttpException extends Error {
	status: number;

	/**
	 *
	 * @param {number} status HTTP status code
	 * @param {string} message Error message
	 */
	constructor(status: number, message: string) {
		super(message);
		this.status = status;
		this.name = "HttpException";
	}
}

/**
 * 400 Bad request
 */
export class HttpBadRequestException extends HttpException {
	constructor(message = "Incorrect request") {
		super(400, message);
		this.name = "HttpBadRequestException";
	}
}

/**
 * 401 Unauthorized
 */
export class HttpUnauthorizedException extends HttpException {
	constructor(message = "Not authorized") {
		super(401, message);
		this.name = "HttpUnauthorizedException";
	}
}

/**
 * 403 Forbidden
 */
export class HttpForbiddenException extends HttpException {
	constructor(message = "Forbidden") {
		super(403, message);
		this.name = "HttpForbiddenException";
	}
}

/**
 * 404 NotFound
 */
export class HttpNotFoundException extends HttpException {
	constructor(message = "Not found") {
		super(404, message);
		this.name = "HttpNotFoundException";
	}
}
