import { StatusCodes } from "http-status-codes";
import type { ActionFunctionArgs } from "react-router";
import type { AccessLevel } from "~/constants/accessLevel";
import { endpoints } from "~/constants/endpoints";
import { fetcher } from "~/lib/fetcher";

type UpdateNoteRequest = {
	content: string;
	accessLevel: AccessLevel;
	tagIds?: string[];
	images?: string[];
};

type UpdateNotePayload = {
	targetDate: string;
	request: UpdateNoteRequest;
};

export async function action({ request, context, params }: ActionFunctionArgs): Promise<Response> {
	try {
		const id = params.id;
		if (!id) {
			return Response.json(
				{ success: false, message: "Invalid request", status: StatusCodes.BAD_REQUEST },
				{ status: StatusCodes.BAD_REQUEST },
			);
		}

		const formData = await request.formData();
		const rawPayload = formData.get("payload");
		if (typeof rawPayload !== "string") {
			return Response.json(
				{ success: false, message: "Invalid request payload", status: StatusCodes.BAD_REQUEST },
				{ status: StatusCodes.BAD_REQUEST },
			);
		}

		const payload = JSON.parse(rawPayload) as UpdateNotePayload;
		if (!payload?.request?.content || !payload.request.accessLevel) {
			return Response.json(
				{ success: false, message: "Missing required fields", status: StatusCodes.BAD_REQUEST },
				{ status: StatusCodes.BAD_REQUEST },
			);
		}

		const res = await fetcher(context, endpoints.notes.update(id), {
			headers: {
				Cookie: request.headers.get("cookie") || "",
			},
			method: "PATCH",
			body: JSON.stringify(payload.request),
		});

		if (!res.ok) {
			const errorText = await res.text();
			const status = res.status || StatusCodes.INTERNAL_SERVER_ERROR;
			return Response.json(
				{
					success: false,
					message: errorText || "Failed to update note",
					status,
				},
				{ status },
			);
		}

		return Response.json(
			{
				success: true,
				message: "ノートを編集しました",
				targetDate: payload.targetDate,
			},
			{ status: StatusCodes.OK },
		);
	} catch (error) {
		console.error("Failed to update note:", error);
		return Response.json(
			{
				success: false,
				message: "Failed to update note",
				status: StatusCodes.INTERNAL_SERVER_ERROR,
			},
			{ status: StatusCodes.INTERNAL_SERVER_ERROR },
		);
	}
}
