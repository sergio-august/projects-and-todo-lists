import "dotenv/config";

function getEnv(name: string): string {
	const value = process.env[name];

	if (value == null) throw new Error(`Missing ${name} in environment`);
	if (value === "") throw new Error(`The ${name} environment variable is empty string`);

	return value;
}

/** TimeZone */
export const tz = getEnv("TZ");

if (tz !== "UTC") throw new Error("TZ must be UTC");

/** Node environment */
export const nodeEnv = process.env["NODE_ENV"] ?? "development";

/** Database URL */
export const dbUrl = getEnv("DB_URL");

/** Secret phrase used in JSON Web Tokens encryption*/
export const jwtSecret = getEnv("JWT_SECRET");

export const serverPort = getEnv("SERVER_PORT");

export const apiUrlPrefix = process.env["API_URL_PREFIX"] ?? "";
