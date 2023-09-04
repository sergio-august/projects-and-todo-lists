/**
 * Raises an error with the given message.
 * @param {string} [message] The message to raise.
 */
export default function raise(message?: string): never {
	throw new Error(message);
}
