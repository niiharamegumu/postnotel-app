import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { CreateTagRequest, Tag } from "../types/tag";

export function useTags() {
	const [tags, setTags] = useState<Tag[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchTags = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch("/tags", {
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error("Tags fetch error:", errorText);
				throw new Error(`タグの取得に失敗しました: ${response.status}`);
			}

			const tags = (await response.json()) as Tag[];
			setTags(tags || []);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "タグの取得に失敗しました";
			console.error("Tags fetch error:", err);
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	}, []);

	const createTag = useCallback(async (name: string): Promise<Tag | null> => {
		setLoading(true);
		setError(null);

		try {
			const body: CreateTagRequest = { name };
			const response = await fetch("/tags/create", {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				throw new Error("タグの作成に失敗しました");
			}

			const tag = (await response.json()) as Tag;
			if (!tag) {
				throw new Error("タグの作成に失敗しました");
			}
			setTags((prev) => [...prev, tag]);
			toast.success(`Tag「${tag.name}」を作成しました`);
			return tag;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "タグの作成に失敗しました";
			setError(errorMessage);
			toast.error(errorMessage);
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	// 初回読み込み
	useEffect(() => {
		fetchTags();
	}, [fetchTags]);

	return {
		tags,
		loading,
		error,
		fetchTags,
		createTag,
	};
}
