import { format } from "date-fns";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ApiResponseError } from "~/api/error/apiResponseError";
import type { NoteApiRequest } from "../types/note";

export function useNotes() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const createNote = useCallback(
		async (params: NoteApiRequest, targetDate: Date): Promise<void> => {
			const { content, accessLevel, images, tagIds } = params;
			if (!content) return;

			setLoading(true);
			setError(null);

			try {
				const body = JSON.stringify({
					content,
					accessLevel,
					images: images,
					tagIds: tagIds,
					noteDay: format(targetDate, "yyyy-MM-dd"),
				});

				const res = await fetch("/api/notes/create", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body,
				});

				if (!res.ok) {
					throw new ApiResponseError(res.status, "ノートの作成に失敗しました");
				}

				navigate(`/notes?date=${format(targetDate, "yyyy-MM-dd")}`);
				toast.success("ノートを作成しました");
			} catch (err) {
				const errorMessage =
					err instanceof ApiResponseError ? err.message : "ノートの作成に失敗しました";
				setError(errorMessage);
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[navigate],
	);

	const updateNote = useCallback(
		async (noteId: string, params: NoteApiRequest, targetDate: Date): Promise<void> => {
			const { content, accessLevel, images, tagIds } = params;
			if (!content) return;

			setLoading(true);
			setError(null);

			try {
				const body = JSON.stringify({
					content,
					accessLevel,
					images,
					tagIds,
				});

				const res = await fetch(`/api/notes/${noteId}/update`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body,
				});

				if (!res.ok) {
					throw new ApiResponseError(res.status, "ノートの編集に失敗しました");
				}

				navigate(`/notes?date=${format(targetDate, "yyyy-MM-dd")}`);
				toast.success("ノートを編集しました");
			} catch (err) {
				const errorMessage =
					err instanceof ApiResponseError ? err.message : "ノートの編集に失敗しました";
				setError(errorMessage);
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[navigate],
	);

	const deleteNote = useCallback(
		async (noteId: string, targetDate: Date): Promise<void> => {
			setLoading(true);
			setError(null);

			try {
				const res = await fetch(`/api/notes/${noteId}/delete`, {
					method: "POST",
				});

				if (!res.ok) {
					throw new ApiResponseError(res.status, "ノートの削除に失敗しました");
				}

				navigate(`/notes?date=${format(targetDate, "yyyy-MM-dd")}`);
				toast.success("ノートを削除しました");
			} catch (err) {
				const errorMessage =
					err instanceof ApiResponseError ? err.message : "ノートの削除に失敗しました";
				setError(errorMessage);
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[navigate],
	);

	return {
		createNote,
		updateNote,
		deleteNote,
		loading,
		error,
	};
}
