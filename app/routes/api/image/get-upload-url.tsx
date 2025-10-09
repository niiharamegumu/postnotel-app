import { StatusCodes } from "http-status-codes";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { endpoints } from "~/constants/endpoints";
import { allowedImageContentTypes, allowedImageFileExtensions } from "~/constants/imageFile";
import type { UploadUrlResponse } from "~/features/image/types/image";
import { fetcher } from "~/lib/fetcher";

export async function loader({ request, context }: LoaderFunctionArgs): Promise<Response> {
	try {
		const urlParams = new URL(request.url).searchParams;
		const ext = urlParams.get("ext");
		const contentType = urlParams.get("contentType");

		if (!ext || !contentType) {
			return Response.json(
				{ success: false, message: "Invalid request parameters", status: StatusCodes.BAD_REQUEST },
				{ status: StatusCodes.BAD_REQUEST },
			);
		}
		if (!allowedImageFileExtensions.includes(ext.toLowerCase())) {
			return Response.json(
				{ success: false, message: "Invalid file extension", status: StatusCodes.BAD_REQUEST },
				{ status: StatusCodes.BAD_REQUEST },
			);
		}
		if (!allowedImageContentTypes.includes(contentType.toLowerCase())) {
			return Response.json(
				{ success: false, message: "Invalid content type", status: StatusCodes.BAD_REQUEST },
				{ status: StatusCodes.BAD_REQUEST },
			);
		}

		const res = await fetcher(
			context,
			`${endpoints.image.getUploadUrl}?ext=${ext}&contentType=${contentType}`,
			{
				headers: {
					Cookie: request.headers.get("cookie") || "",
				},
			},
		);

		if (!res.ok) {
			const errorText = await res.text();
			const status = res.status || StatusCodes.INTERNAL_SERVER_ERROR;
			return Response.json(
				{
					success: false,
					message: errorText || "Failed to get upload URL",
					status,
				},
				{ status },
			);
		}

		const data = await res.json();
		return Response.json(
			{
				success: true,
				upload: data,
			},
			{ status: StatusCodes.OK },
		);
	} catch (error) {
		console.error("Failed to get upload URL:", error);
		return Response.json(
			{
				success: false,
				message: "Failed to get upload URL",
				status: StatusCodes.INTERNAL_SERVER_ERROR,
			},
			{ status: StatusCodes.INTERNAL_SERVER_ERROR },
		);
	}
}

type BatchUploadRequest = {
	files: Array<{
		ext: string;
		contentType: string;
	}>;
};

type BatchUploadResponse = {
	success: boolean;
	uploads?: UploadUrlResponse[];
	message?: string;
	status?: number;
};

export async function action({ request, context }: ActionFunctionArgs): Promise<Response> {
	if (request.method !== "POST") {
		return Response.json(
			{
				success: false,
				message: "Method not allowed",
				status: StatusCodes.METHOD_NOT_ALLOWED,
			},
			{ status: StatusCodes.METHOD_NOT_ALLOWED },
		);
	}

	try {
		const payload = (await request.json()) as BatchUploadRequest | null;
		if (!payload?.files || !Array.isArray(payload.files) || payload.files.length === 0) {
			return Response.json(
				{
					success: false,
					message: "Invalid request payload",
					status: StatusCodes.BAD_REQUEST,
				},
				{ status: StatusCodes.BAD_REQUEST },
			);
		}

		const tasks = payload.files.map(async ({ ext, contentType }) => {
			if (!ext || !contentType) {
				throw new Response("Invalid file descriptor", { status: StatusCodes.BAD_REQUEST });
			}

			const normalizedExt = ext.toLowerCase();
			const normalizedContentType = contentType.toLowerCase();
			if (!allowedImageFileExtensions.includes(normalizedExt)) {
				throw new Response("Invalid file extension", { status: StatusCodes.BAD_REQUEST });
			}
			if (!allowedImageContentTypes.includes(normalizedContentType)) {
				throw new Response("Invalid content type", { status: StatusCodes.BAD_REQUEST });
			}

			const res = await fetcher(
				context,
				`${endpoints.image.getUploadUrl}?ext=${encodeURIComponent(normalizedExt)}&contentType=${encodeURIComponent(normalizedContentType)}`,
				{
					headers: {
						Cookie: request.headers.get("cookie") || "",
					},
				},
			);

			if (!res.ok) {
				const errorText = await res.text();
				throw new Response(errorText || "Failed to get upload URL", { status: res.status });
			}

			return (await res.json()) as UploadUrlResponse;
		});

		const uploads = await Promise.all(tasks);

		const body: BatchUploadResponse = {
			success: true,
			uploads,
		};
		return Response.json(body, { status: StatusCodes.OK });
	} catch (error) {
		console.error("Batch upload URL request failed:", error);
		const message =
			error instanceof Response
				? await error.text()
				: error instanceof Error
					? error.message
					: "Failed to get upload URL";
		const status = error instanceof Response ? error.status : StatusCodes.INTERNAL_SERVER_ERROR;
		const body: BatchUploadResponse = {
			success: false,
			message,
			status,
		};
		return Response.json(body, { status });
	}
}
