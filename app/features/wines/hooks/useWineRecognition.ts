import { format } from "date-fns";
import { StatusCodes } from "http-status-codes";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ApiResponseError } from "~/api/error/apiResponseError";
import { AccessLevel } from "~/constants/accessLevel";

export function useWineRecognition() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const recognizeWine = useCallback(
		async (
			images: string[],
			options?: { noteDay?: string; accessLevel?: AccessLevel },
		): Promise<void> => {
			if (images.length === 0) {
				toast.error("画像を選択してください");
				return;
			}

			setLoading(true);
			setError(null);

			try {
				const noteDay = options?.noteDay || format(new Date(), "yyyy-MM-dd");
				const accessLevel = options?.accessLevel || AccessLevel.Public;

				const imagesFileNames = images.map((url) => {
					const parts = url.split("/");
					return parts[parts.length - 1];
				});

				if (imagesFileNames.some((name) => !name || name.trim() === "")) {
					throw new Error("無効な画像ファイルが含まれています");
				}

				const body = JSON.stringify({
					noteDay,
					accessLevel,
					images: imagesFileNames,
				});

				const res = await fetch("/api/wines/recognize", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body,
				});

				if (!res.ok) {
					const errorData = (await res.json().catch(() => ({}))) as {
						error?: string;
						details?: string;
					};
					let errorMessage = errorData.error || "処理に失敗しました";

					if (errorData.details && res.status === StatusCodes.BAD_REQUEST) {
						errorMessage += `: ${errorData.details}`;
					}

					throw new ApiResponseError(res.status, errorMessage);
				}

				navigate("/wines");
				toast.success("ワインノートの作成をAIへリクエストしました");
			} catch (err) {
				console.error("ワインノートの作成に失敗:", err);

				let errorMessage: string;
				if (err instanceof ApiResponseError) {
					errorMessage = err.message;
				} else if (err instanceof Error) {
					errorMessage = err.message;
				} else {
					errorMessage = "ワインノートの作成に失敗しました";
				}

				setError(errorMessage);
				toast.error(errorMessage);
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[navigate],
	);

	return {
		recognizeWine,
		loading,
		error,
	};
}
