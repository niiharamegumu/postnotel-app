import { StatusCodes } from "http-status-codes";
import type { AppLoadContext } from "react-router";

export type FetchOptions = {
	method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	headers?: HeadersInit;
	body?: BodyInit;
	credentials?: RequestCredentials;
};

type FetcherExtras = {
	fallbackPath?: string;
};

export async function fetcher(
	ctx: AppLoadContext,
	path: string,
	options: FetchOptions = {},
	extra: FetcherExtras = {},
): Promise<Response> {
	const requestInit: RequestInit = {
		method: options.method || "GET",
		credentials: options.credentials || "include",
		headers: {
			"Content-Type": "application/json",
			...options.headers,
		},
		body: options.body,
	};

	const apiBaseUrl = ctx?.cloudflare?.env?.API_BASE_URL;
	const targetUrl = apiBaseUrl ? `${apiBaseUrl}${path}` : undefined;

	const resolvedUrl = targetUrl ?? extra.fallbackPath;
	if (!resolvedUrl) {
		throw new Error("API_BASE_URL is not configured and no fallbackPath was provided.");
	}

	const response = await fetch(resolvedUrl, requestInit);

	if (response.status >= StatusCodes.INTERNAL_SERVER_ERROR) {
		throw new Error(`HTTP error! Status: ${response.status}`);
	}

	return response;
}
