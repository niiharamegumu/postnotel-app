import { format } from "date-fns";
import { StatusCodes } from "http-status-codes";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFetcher, useNavigate } from "react-router";
import { toast } from "sonner";
import { ApiResponseError } from "~/api/error/apiResponseError";
import { AccessLevel } from "~/constants/accessLevel";

export function useWineRecognition() {
	const navigate = useNavigate();
	const fetcher = useFetcher<{
		success: boolean;
		message?: string;
		status?: number;
		details?: string;
	}>();
	const pendingRef = useRef<{
		resolve: () => void;
		reject: (error: Error) => void;
	} | null>(null);

	const recognizeWine = useCallback(
		(
			images: string[],
			options?: { noteDay?: string; accessLevel?: AccessLevel },
		): Promise<void> => {
			if (images.length === 0) {
				toast.error("画像を選択してください");
				return Promise.resolve();
			}

			const imagesFileNames = images.map((url) => {
				const parts = url.split("/");
				return parts[parts.length - 1];
			});

			if (imagesFileNames.some((name) => !name || name.trim() === "")) {
				toast.error("無効な画像ファイルが含まれています");
				return Promise.resolve();
			}

			const noteDay = options?.noteDay || format(new Date(), "yyyy-MM-dd");
			const accessLevel = options?.accessLevel || AccessLevel.Public;
			const formData = new FormData();
			formData.append(
				"payload",
				JSON.stringify({
					request: {
						noteDay,
						accessLevel,
						images: imagesFileNames,
					},
				}),
			);

			fetcher.submit(formData, { action: "/api/wines/recognize", method: "post" });

			return new Promise<void>((resolve, reject) => {
				pendingRef.current = { resolve, reject };
			});
		},
		[fetcher],
	);

	useEffect(() => {
		if (fetcher.state !== "idle" || !pendingRef.current) return;

		const pending = pendingRef.current;
		pendingRef.current = null;

		const data = fetcher.data;
		if (data?.success) {
			toast.success(data.message ?? "ワインノートの作成をAIへリクエストしました");
			navigate("/wines");
			pending.resolve();
			return;
		}

		const message = data?.message || data?.details || "ワインノートの作成に失敗しました";
		const status = data?.status ?? StatusCodes.INTERNAL_SERVER_ERROR;
		toast.error(message);
		pending.reject(new ApiResponseError(status, message));
	}, [fetcher, navigate]);

	useEffect(() => {
		return () => {
			pendingRef.current = null;
		};
	}, []);

	const loading = useMemo(() => fetcher.state !== "idle", [fetcher.state]);

	return {
		recognizeWine,
		loading,
	};
}
