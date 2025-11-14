import { formatInTimeZone } from "date-fns-tz";
import { StatusCodes } from "http-status-codes";
import type { ActionFunctionArgs } from "react-router";
import type { AccessLevel } from "~/constants/accessLevel";
import { endpoints } from "~/constants/endpoints";
import { fetcher } from "~/lib/fetcher";

type CreateNoteRequest = {
	content: string;
	accessLevel: AccessLevel;
	noteDay: string;
	tagIds?: string[];
	images?: string[];
};

type CreateNotePayload = {
	targetDate: string;
	request: CreateNoteRequest;
};

export async function action({ request, context }: ActionFunctionArgs): Promise<Response> {
	try {
		const formData = await request.formData();
		const rawPayload = formData.get("payload");
		if (typeof rawPayload !== "string") {
			return Response.json(
				{ success: false, message: "Invalid request payload", status: StatusCodes.BAD_REQUEST },
				{ status: StatusCodes.BAD_REQUEST },
			);
		}

		const payload = JSON.parse(rawPayload) as CreateNotePayload;
		if (!payload?.request?.content || !payload.request.accessLevel || !payload.request.noteDay) {
			return Response.json(
				{ success: false, message: "Missing required fields", status: StatusCodes.BAD_REQUEST },
				{ status: StatusCodes.BAD_REQUEST },
			);
		}

		const todayJST: string = formatInTimeZone(new Date(), "Asia/Tokyo", "yyyy-MM-dd");

		if (payload.request.noteDay !== todayJST) {
			return Response.json(
				{
					success: false,
					message: "今日の日付のノートのみ作成できます",
					status: StatusCodes.BAD_REQUEST,
				},
				{ status: StatusCodes.BAD_REQUEST },
			);
		}

		const res = await fetcher(context, endpoints.notes.create, {
			headers: {
				Cookie: request.headers.get("cookie") || "",
			},
			method: "POST",
			body: JSON.stringify(payload.request),
		});

		if (!res.ok) {
			const errorText = await res.text();
			const status = res.status || StatusCodes.INTERNAL_SERVER_ERROR;
			return Response.json(
				{
					success: false,
					message: errorText || "Failed to create note",
					status,
				},
				{ status },
			);
		}

		return Response.json(
			{
				success: true,
				message: "ノートを作成しました",
				targetDate: payload.targetDate,
			},
			{ status: StatusCodes.OK },
		);
	} catch (error) {
		console.error("Failed to create note:", error);
		return Response.json(
			{
				success: false,
				message: "Failed to create note",
				status: StatusCodes.INTERNAL_SERVER_ERROR,
			},
			{ status: StatusCodes.INTERNAL_SERVER_ERROR },
		);
	}
}
