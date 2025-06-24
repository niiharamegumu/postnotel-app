import type { ActionFunctionArgs } from "react-router";
import type { AccessLevel } from "~/constants/accessLevel";
import { endpoints } from "~/constants/endpoints";
import { fetcher } from "~/lib/fetcher";

type Body = {
	accessLevel: AccessLevel;
	noteDay: string;
	images: string[];
};

export async function action({ request, context }: ActionFunctionArgs): Promise<Response> {
	try {
		const body: Body = await request.json();
		if (!body.images || body.images.length === 0) {
			throw new Response("Invalid request body", { status: 400 });
		}
		const res = await fetcher(context, endpoints.wines.recognize, {
			headers: {
				Cookie: request.headers.get("cookie") || "",
			},
			method: "POST",
			body: JSON.stringify(body),
		});
		return res;
	} catch (error) {
		console.error("Failed to recognize wine label:", error);
		return new Response("Failed to recognize wine label", { status: 500 });
	}
}
