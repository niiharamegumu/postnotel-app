export type FetchOptions = {
	method?: "GET" | "POST" | "PUT" | "DELETE";
	headers?: HeadersInit;
	body?: BodyInit;
	credentials?: RequestCredentials;
};

export async function fetcher(url: string, options: FetchOptions = {}): Promise<Response> {
	const response = await fetch(url, {
		method: options.method || "GET",
		credentials: options.credentials || "include",
		headers: {
			"Content-Type": "application/json",
			...options.headers,
		},
		body: options.body,
	});

	if (!response.ok) {
		throw new Error(`HTTP error! Status: ${response.status}`);
	}

	return response;
}
