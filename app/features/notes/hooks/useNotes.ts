import { format } from "date-fns";
import { StatusCodes } from "http-status-codes";
import { type RefObject, useCallback, useEffect, useMemo, useRef } from "react";
import { useFetcher, useLocation, useNavigate, useRevalidator } from "react-router";
import type { FetcherWithComponents } from "react-router";
import { toast } from "sonner";
import { ApiResponseError } from "~/api/error/apiResponseError";
import type { NoteApiRequest } from "../types/note";

type NoteActionResponse = {
	success: boolean;
	message?: string;
	targetDate?: string;
	status?: number;
};

type PendingResolver = {
	resolve: () => void;
	reject: (error: Error) => void;
};

type NoteFetcher = FetcherWithComponents<NoteActionResponse>;

export function useNotes() {
	const navigate = useNavigate();
	const location = useLocation();
	const revalidator = useRevalidator();
	const createFetcher = useFetcher<NoteActionResponse>();
	const updateFetcher = useFetcher<NoteActionResponse>();
	const deleteFetcher = useFetcher<NoteActionResponse>();

	const createPendingRef = useRef<PendingResolver | null>(null);
	const updatePendingRef = useRef<PendingResolver | null>(null);
	const deletePendingRef = useRef<PendingResolver | null>(null);

	const submitPayload = useCallback(
		(
			fetcher: NoteFetcher,
			payload: unknown,
			action: string,
			setPending: (resolver: PendingResolver | null) => void,
		) => {
			const formData = new FormData();
			formData.append("payload", JSON.stringify(payload));

			fetcher.submit(formData, {
				action,
				method: "post",
			});

			return new Promise<void>((resolve, reject) => {
				setPending({ resolve, reject });
			});
		},
		[],
	);

	const createNote = useCallback(
		(params: NoteApiRequest, targetDate: Date): Promise<void> => {
			const { content, accessLevel, images, tagIds } = params;
			if (!content) return Promise.resolve();

			const noteDay = format(targetDate, "yyyy-MM-dd");
			return submitPayload(
				createFetcher,
				{
					targetDate: noteDay,
					request: {
						content,
						accessLevel,
						images,
						tagIds,
						noteDay,
					},
				},
				"/api/notes/create",
				(resolver) => {
					createPendingRef.current = resolver;
				},
			);
		},
		[createFetcher, submitPayload],
	);

	const updateNote = useCallback(
		(noteId: string, params: NoteApiRequest, targetDate: Date): Promise<void> => {
			const { content, accessLevel, images, tagIds } = params;
			if (!content) return Promise.resolve();

			const targetDateStr = format(targetDate, "yyyy-MM-dd");
			return submitPayload(
				updateFetcher,
				{
					targetDate: targetDateStr,
					request: {
						content,
						accessLevel,
						images,
						tagIds,
					},
				},
				`/api/notes/${noteId}/update`,
				(resolver) => {
					updatePendingRef.current = resolver;
				},
			);
		},
		[submitPayload, updateFetcher],
	);

	const deleteNote = useCallback(
		(noteId: string, targetDate: Date): Promise<void> => {
			const targetDateStr = format(targetDate, "yyyy-MM-dd");
			return submitPayload(
				deleteFetcher,
				{
					targetDate: targetDateStr,
				},
				`/api/notes/${noteId}/delete`,
				(resolver) => {
					deletePendingRef.current = resolver;
				},
			);
		},
		[deleteFetcher, submitPayload],
	);

	const handleCompletion = useCallback(
		(
			fetcher: typeof createFetcher,
			pendingRef: RefObject<PendingResolver | null>,
			fallbackMessage: string,
		) => {
			if (fetcher.state !== "idle" || !pendingRef.current) return;

			const pending = pendingRef.current;
			pendingRef.current = null;

			const data = fetcher.data;
			if (data?.success) {
				const message = data.message || fallbackMessage;
				if (data.targetDate) {
					const currentParams = new URLSearchParams(location.search);
					const currentDate = currentParams.get("date");
					if (currentDate === data.targetDate) {
						revalidator.revalidate();
					} else {
						navigate(`/notes?date=${data.targetDate}`);
					}
				}
				toast.success(message);
				pending.resolve();
				return;
			}

			const message = data?.message || fallbackMessage;
			const status = data?.status ?? StatusCodes.INTERNAL_SERVER_ERROR;
			pending.reject(new ApiResponseError(status, message));
		},
		[location.search, navigate, revalidator],
	);

	useEffect(() => {
		handleCompletion(createFetcher, createPendingRef, "ノートの作成に失敗しました");
	}, [createFetcher, handleCompletion]);

	useEffect(() => {
		handleCompletion(updateFetcher, updatePendingRef, "ノートの編集に失敗しました");
	}, [handleCompletion, updateFetcher]);

	useEffect(() => {
		handleCompletion(deleteFetcher, deletePendingRef, "ノートの削除に失敗しました");
	}, [deleteFetcher, handleCompletion]);

	const loading = useMemo(
		() =>
			createFetcher.state !== "idle" ||
			updateFetcher.state !== "idle" ||
			deleteFetcher.state !== "idle",
		[createFetcher.state, updateFetcher.state, deleteFetcher.state],
	);

	useEffect(() => {
		return () => {
			createPendingRef.current = null;
			updatePendingRef.current = null;
			deletePendingRef.current = null;
		};
	}, []);

	return {
		createNote,
		updateNote,
		deleteNote,
		loading,
	};
}
