import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import type { CreateTagRequest, Tag } from "../types/tag";

type CreateTagResponse =
	| { success: true; tag: Tag }
	| { success: false; message: string; status?: number };

export function useTags() {
	const listFetcher = useFetcher<Tag[]>();
	const createFetcher = useFetcher<CreateTagResponse>();
	const pendingRef = useRef<{
		resolve: (value: Tag | null) => void;
	} | null>(null);
	const [tags, setTags] = useState<Tag[]>([]);

	const fetchTags = useCallback(async () => {
		listFetcher.load("/api/tags");
	}, [listFetcher]);

	useEffect(() => {
		if (listFetcher.state === "idle" && listFetcher.data === undefined) {
			listFetcher.load("/api/tags");
		}
	}, [listFetcher]);

	useEffect(() => {
		if (Array.isArray(listFetcher.data)) {
			setTags(listFetcher.data);
		}
	}, [listFetcher.data]);

	const createTag = useCallback(
		(name: string): Promise<Tag | null> => {
			const trimmed = name.trim();
			if (!trimmed) {
				toast.error("タグ名を入力してください");
				return Promise.resolve(null);
			}

			const formData = new FormData();
			const payload: { request: CreateTagRequest } = {
				request: { name: trimmed },
			};
			formData.append("payload", JSON.stringify(payload));
			createFetcher.submit(formData, { action: "/api/tags/create", method: "post" });

			return new Promise<Tag | null>((resolve) => {
				pendingRef.current = { resolve };
			});
		},
		[createFetcher],
	);

	useEffect(() => {
		if (createFetcher.state !== "idle" || !pendingRef.current) {
			return;
		}

		const pending = pendingRef.current;
		pendingRef.current = null;

		const data = createFetcher.data;
		if (data?.success && data.tag) {
			setTags((prev) => (prev.some((tag) => tag.id === data.tag.id) ? prev : [...prev, data.tag]));
			toast.success(`Tag「${data.tag.name}」を作成しました`);
			pending.resolve(data.tag);
			return;
		}

		const message =
			data && "message" in data && data.message ? data.message : "タグの作成に失敗しました";
		toast.error(message);
		pending.resolve(null);
	}, [createFetcher]);

	const loading = useMemo(
		() => listFetcher.state === "loading" || createFetcher.state !== "idle",
		[listFetcher.state, createFetcher.state],
	);

	useEffect(() => {
		return () => {
			pendingRef.current = null;
		};
	}, []);

	return {
		tags,
		loading,
		fetchTags,
		createTag,
	};
}
