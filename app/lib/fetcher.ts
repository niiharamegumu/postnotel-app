import { StatusCodes } from "http-status-codes";
import type { AppLoadContext } from "react-router";

export type FetchOptions = {
	method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	headers?: HeadersInit;
	body?: BodyInit;
	credentials?: RequestCredentials;
};

export async function fetcher(
	ctx: AppLoadContext,
	path: string,
	options: FetchOptions = {},
): Promise<Response> {
	const response = await fetch(`${ctx.cloudflare.env.API_BASE_URL}${path}`, {
		method: options.method || "GET",
		credentials: options.credentials || "include",
		headers: {
			"Content-Type": "application/json",
			...options.headers,
		},
		body: options.body,
	});

	if (response.status >= StatusCodes.INTERNAL_SERVER_ERROR) {
		throw new Error(`HTTP error! Status: ${response.status}`);
	}

	return response;
}
