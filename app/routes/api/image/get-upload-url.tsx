import { StatusCodes } from "http-status-codes";
import type { LoaderFunctionArgs } from "react-router";
import { endpoints } from "~/constants/endpoints";
import { allowedImageContentTypes, allowedImageFileExtensions } from "~/constants/imageFile";
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
