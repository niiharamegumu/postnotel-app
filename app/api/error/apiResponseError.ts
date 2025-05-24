/**
 * Custom error class for API responses
 * @extends Error
 */
export class ApiResponseError extends Error {
	/**
	 * HTTP status code of the error
	 */
	readonly status: number;

	/**
	 * Error message
	 */
	readonly message: string;

	/**
	 * Creates a new ApiResponseError
	 * @param status - HTTP status code
	 * @param message - Error message
	 */
	constructor(status: number, message: string) {
		super(message);
		this.status = status;
		this.message = message;
	}
}
