import type { ActionFunctionArgs } from "react-router";
import type { AccessLevel } from "~/constants/accessLevel";
import { endpoints } from "~/constants/endpoints";
import { fetcher } from "~/lib/fetcher";
import { StatusCodes } from "http-status-codes";

type Body = {
	accessLevel: AccessLevel;
	noteDay: string;
	images: string[];
};

function validateBody(body: unknown): body is Body {
	if (!body || typeof body !== "object") {
		return false;
	}

	const candidate = body as Record<string, unknown>;

	return (
		typeof candidate.accessLevel === "string" &&
		typeof candidate.noteDay === "string" &&
		Array.isArray(candidate.images) &&
		candidate.images.length > 0 &&
		candidate.images.every((img) => typeof img === "string" && img.trim().length > 0)
	);
}

export async function action({ request, context }: ActionFunctionArgs): Promise<Response> {
	try {
		const body = await request.json();

		if (!validateBody(body)) {
			return new Response(
				JSON.stringify({
					error: "Invalid request body",
					details: "Required fields: accessLevel, noteDay, images (non-empty array)",
				}),
				{
					status: StatusCodes.BAD_REQUEST,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const res = await fetcher(context, endpoints.wines.recognize, {
			headers: {
				Cookie: request.headers.get("cookie") || "",
			},
			method: "POST",
			body: JSON.stringify(body),
		});

		if (!res.ok) {
			const errorText = await res.text();
			console.error(`API error: ${res.status} - ${errorText}`);

			return new Response(
				JSON.stringify({
					error: "Failed to process wine recognition",
					status: res.status,
					details:
						res.status >= StatusCodes.INTERNAL_SERVER_ERROR ? "Internal server error" : errorText,
				}),
				{
					status: res.status,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		return res;
	} catch (error) {
		console.error("Failed to recognize wine label:", error);

		const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

		return new Response(
			JSON.stringify({
				error: "Failed to recognize wine label",
				details: errorMessage,
			}),
			{
				status: StatusCodes.INTERNAL_SERVER_ERROR,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
