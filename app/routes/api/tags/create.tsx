import type { ActionFunctionArgs } from "react-router";
import { fetcher } from "~/lib/fetcher";
import { endpoints } from "~/constants/endpoints";
import type { CreateTagRequest, Tag } from "~/features/tags/types/tag";

export async function action({ request, context }: ActionFunctionArgs) {
	if (request.method !== "POST") {
		throw new Response("Method not allowed", { status: 405 });
	}

	try {
		const body: CreateTagRequest = await request.json();
		const response = await fetcher(context, endpoints.tags.create, {
			method: "POST",
			body: JSON.stringify(body),
			headers: {
				Cookie: request.headers.get("cookie") || "",
			},
		});

		if (!response.ok) {
			throw new Error(response.body ? await response.text() : "タグの作成に失敗しました");
		}

		const newTag: Tag = await response.json();
		return newTag;
	} catch (error) {
		console.error("Create tag error:", error);
		return null;
	}
}
