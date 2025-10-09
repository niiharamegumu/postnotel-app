import { StatusCodes } from "http-status-codes";
import type { ActionFunctionArgs } from "react-router";
import { endpoints } from "~/constants/endpoints";
import type { CreateTagRequest, Tag } from "~/features/tags/types/tag";
import { fetcher } from "~/lib/fetcher";

type CreateTagPayload = {
	request: CreateTagRequest;
};

export async function action({ request, context }: ActionFunctionArgs) {
	if (request.method !== "POST") {
		return Response.json(
			{ success: false, message: "Method not allowed", status: StatusCodes.METHOD_NOT_ALLOWED },
			{ status: StatusCodes.METHOD_NOT_ALLOWED },
		);
	}

	try {
		const formData = await request.formData();
		const rawPayload = formData.get("payload");
		if (typeof rawPayload !== "string") {
			return Response.json(
				{ success: false, message: "Invalid request payload", status: StatusCodes.BAD_REQUEST },
				{ status: StatusCodes.BAD_REQUEST },
			);
		}

		const payload = JSON.parse(rawPayload) as CreateTagPayload;
		if (!payload?.request?.name) {
			return Response.json(
				{ success: false, message: "Missing required fields", status: StatusCodes.BAD_REQUEST },
				{ status: StatusCodes.BAD_REQUEST },
			);
		}

		const response = await fetcher(context, endpoints.tags.create, {
			method: "POST",
			body: JSON.stringify(payload.request),
			headers: {
				Cookie: request.headers.get("cookie") || "",
			},
		});

		if (!response.ok) {
			const errorText = response.body ? await response.text() : undefined;
			const status = response.status || StatusCodes.INTERNAL_SERVER_ERROR;
			return Response.json(
				{
					success: false,
					message: errorText || "タグの作成に失敗しました",
					status,
				},
				{ status },
			);
		}

		const newTag: Tag = await response.json();
		return Response.json(
			{
				success: true,
				tag: newTag,
			},
			{ status: StatusCodes.OK },
		);
	} catch (error) {
		console.error("Create tag error:", error);
		return Response.json(
			{
				success: false,
				message: "タグの作成に失敗しました",
				status: StatusCodes.INTERNAL_SERVER_ERROR,
			},
			{ status: StatusCodes.INTERNAL_SERVER_ERROR },
		);
	}
}
