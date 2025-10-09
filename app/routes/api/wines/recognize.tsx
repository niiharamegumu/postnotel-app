import { StatusCodes } from "http-status-codes";
import type { ActionFunctionArgs } from "react-router";
import type { AccessLevel } from "~/constants/accessLevel";
import { endpoints } from "~/constants/endpoints";
import { fetcher } from "~/lib/fetcher";

type RecognizeRequest = {
	accessLevel: AccessLevel;
	noteDay: string;
	images: string[];
};

type RecognizePayload = {
	request: RecognizeRequest;
};

function validateBody(body: unknown): body is RecognizeRequest {
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
		const formData = await request.formData();
		const rawPayload = formData.get("payload");
		if (typeof rawPayload !== "string") {
			return Response.json(
				{
					success: false,
					message: "Invalid request payload",
					status: StatusCodes.BAD_REQUEST,
				},
				{ status: StatusCodes.BAD_REQUEST },
			);
		}

		const payload = JSON.parse(rawPayload) as RecognizePayload;
		if (!validateBody(payload?.request)) {
			return Response.json(
				{
					success: false,
					message: "Invalid request body",
					details: "Required fields: accessLevel, noteDay, images (non-empty array)",
					status: StatusCodes.BAD_REQUEST,
				},
				{ status: StatusCodes.BAD_REQUEST },
			);
		}

		const res = await fetcher(context, endpoints.wines.recognize, {
			headers: {
				Cookie: request.headers.get("cookie") || "",
			},
			method: "POST",
			body: JSON.stringify(payload.request),
		});

		if (!res.ok) {
			const errorText = await res.text();
			console.error(`API error: ${res.status} - ${errorText}`);
			const status = res.status || StatusCodes.INTERNAL_SERVER_ERROR;
			return Response.json(
				{
					success: false,
					message: "Failed to process wine recognition",
					status,
					details:
						status >= StatusCodes.INTERNAL_SERVER_ERROR ? "Internal server error" : errorText,
				},
				{ status },
			);
		}

		return Response.json(
			{
				success: true,
				message: "ワインノートの作成をAIへリクエストしました",
			},
			{ status: StatusCodes.OK },
		);
	} catch (error) {
		console.error("Failed to recognize wine label:", error);

		const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

		return Response.json(
			{
				success: false,
				message: "Failed to recognize wine label",
				details: errorMessage,
				status: StatusCodes.INTERNAL_SERVER_ERROR,
			},
			{ status: StatusCodes.INTERNAL_SERVER_ERROR },
		);
	}
}
