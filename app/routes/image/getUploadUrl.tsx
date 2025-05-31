import type { LoaderFunctionArgs } from "react-router";
import { endpoints } from "~/constants/endpoints";
import { allowedImageContentTypes, allowedImageFileExtensions } from "~/constants/imageFile";
import { fetcher } from "~/lib/fetcher";

export async function loader({ request, context }: LoaderFunctionArgs): Promise<Response> {
	try {
		const urlParams = new URL(request.url).searchParams;
		const ext = urlParams.get("ext");
		const contentType = urlParams.get("contentType");

		if (!ext || !contentType) return new Response("Invalid request parameters", { status: 400 });
		if (!allowedImageFileExtensions.includes(ext.toLowerCase()))
			return new Response("Invalid file extension", { status: 400 });
		if (!allowedImageContentTypes.includes(contentType.toLowerCase()))
			return new Response("Invalid content type", { status: 400 });

		const res = await fetcher(
			context,
			`${endpoints.image.getUploadUrl}?ext=${ext}&contentType=${contentType}`,
			{
				headers: {
					Cookie: request.headers.get("cookie") || "",
				},
			},
		);
		return res;
	} catch (error) {
		console.error("Failed to get upload URL:", error);
		return new Response("Failed to get upload URL", { status: 500 });
	}
}
