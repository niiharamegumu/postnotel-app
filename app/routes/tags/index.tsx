import type { LoaderFunctionArgs } from "react-router";
import { fetcher } from "~/lib/fetcher";
import { endpoints } from "~/constants/endpoints";
import type { Tag, TagsResponse } from "~/features/tags/types/tag";

export async function loader({ request, context }: LoaderFunctionArgs): Promise<Tag[]> {
	try {
		const response = await fetcher(context, endpoints.tags.list, {
			headers: {
				Cookie: request.headers.get("cookie") || "",
			},
		});
		if (!response.ok) {
			throw new Error("タグの取得に失敗しました");
		}
		const tags: TagsResponse = await response.json();
		return tags.tags || [];
	} catch (error) {
		console.error("Tags loader error:", error);
		return [];
	}
}
