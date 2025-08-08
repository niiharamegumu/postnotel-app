import type { Tag } from "~/features/tags/types/tag";
import type { SearchLoaderData } from "./useSearchLoader";

export type MetaDescriptor = {
	title?: string;
	name?: string;
	content?: string;
};

export function useSearchMeta(data: SearchLoaderData): MetaDescriptor[] {
	const selectedTags: Tag[] = data?.selectedTags || [];
	const searchQuery: string = data?.searchQuery || "";

	let title = "検索 - PostNotel Notes";
	let description = "ノートを検索";

	if (searchQuery && selectedTags.length > 0) {
		title = `「${searchQuery}」${selectedTags.map((tag) => tag.name).join(", ")} - PostNotel Notes`;
		description = `「${searchQuery}」でタグ検索`;
	} else if (searchQuery) {
		title = `「${searchQuery}」- PostNotel Notes`;
		description = `「${searchQuery}」で検索`;
	} else if (selectedTags.length > 0) {
		title = `${selectedTags.map((tag) => tag.name).join(", ")} - PostNotel Notes`;
		description = "タグでノートを検索";
	}

	return [{ title }, { name: "description", content: description }];
}
