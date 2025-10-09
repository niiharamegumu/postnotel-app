import { StatusCodes } from "http-status-codes";
import type { ActionFunctionArgs } from "react-router";
import { endpoints } from "~/constants/endpoints";
import { fetcher } from "~/lib/fetcher";

type DeleteNotePayload = {
	targetDate: string;
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
		const payload: DeleteNotePayload | null =
			typeof rawPayload === "string" ? (JSON.parse(rawPayload) as DeleteNotePayload) : null;
		if (!payload?.targetDate) {
			return Response.json(
				{ success: false, message: "Missing required fields", status: StatusCodes.BAD_REQUEST },
				{ status: StatusCodes.BAD_REQUEST },
			);
		}

		const res = await fetcher(context, endpoints.notes.delete(id), {
			headers: {
				Cookie: request.headers.get("cookie") || "",
			},
			method: "DELETE",
		});

		if (!res.ok) {
			const errorText = await res.text();
			const status = res.status || StatusCodes.INTERNAL_SERVER_ERROR;
			return Response.json(
				{
					success: false,
					message: errorText || "Failed to delete note",
					status,
				},
				{ status },
			);
		}

		return Response.json(
			{
				success: true,
				message: "ノートを削除しました",
				targetDate: payload.targetDate,
			},
			{ status: StatusCodes.OK },
		);
	} catch (error) {
		console.error("Failed to delete note:", error);
		return Response.json(
			{
				success: false,
				message: "Failed to delete note",
				status: StatusCodes.INTERNAL_SERVER_ERROR,
			},
			{ status: StatusCodes.INTERNAL_SERVER_ERROR },
		);
	}
}
