import imageCompression from "browser-image-compression";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import { imageCompressionOptions } from "~/constants/imageFile";
import type { UploadUrlResponse } from "~/features/image/types/image";

export const useImageUpload = () => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [uploadedImages, setUploadedImages] = useState<string[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const uploadFetcher = useFetcher<{
		success: boolean;
		uploads?: UploadUrlResponse[];
		message?: string;
		status?: number;
	}>();
	const batchPendingRef = useRef<{
		files: File[];
		resolve: (uploads: UploadUrlResponse[]) => void;
		reject: (error: Error) => void;
	} | null>(null);

	const requestUploadInfos = useCallback(
		async (files: File[]): Promise<UploadUrlResponse[]> => {
			if (files.length === 0) return [];

			if (batchPendingRef.current) {
				throw new Error("別のアップロード処理が進行中です");
			}

			const payload = {
				files: files.map((file) => {
					const fileNameParts = file.name.split(".");
					const ext =
						fileNameParts.length > 1 ? fileNameParts[fileNameParts.length - 1].toLowerCase() : "";
					return {
						ext,
						contentType: file.type,
					};
				}),
			};

			return await new Promise<UploadUrlResponse[]>((resolve, reject) => {
				batchPendingRef.current = {
					files,
					resolve,
					reject,
				};
				uploadFetcher.submit(JSON.stringify(payload), {
					action: "/api/image/get-upload-url",
					method: "post",
					encType: "application/json",
				});
			});
		},
		[uploadFetcher],
	);

	const uploadToStorage = useCallback(
		async (file: File, uploadData: UploadUrlResponse): Promise<string> => {
			const uploadResponse = await fetch(uploadData.url, {
				method: uploadData.method,
				headers: {
					"Content-Type": file.type,
				},
				body: file,
			});

			if (!uploadResponse.ok) {
				throw new Error("Failed to upload image");
			}

			return `${uploadData.storageBaseUrl}/temporary/${uploadData.fileName}`;
		},
		[],
	);

	const handleImageUpload = useCallback(
		async (files: File[]) => {
			try {
				const uploadInfos = await requestUploadInfos(files);
				if (uploadInfos.length !== files.length) {
					throw new Error("アップロード情報の取得に失敗しました");
				}

				const uploadResults = await Promise.allSettled(
					uploadInfos.map((info, index) => uploadToStorage(files[index], info)),
				);

				const successfulUrls = uploadResults
					.filter(
						(result): result is PromiseFulfilledResult<string> => result.status === "fulfilled",
					)
					.map((result) => result.value);

				const failedCount = uploadResults.length - successfulUrls.length;
				if (successfulUrls.length > 0) {
					setUploadedImages((prev) => [...prev, ...successfulUrls]);
					toast.success(`${successfulUrls.length}枚の画像をアップロードしました`);
				}

				if (failedCount > 0) {
					toast.error(`${failedCount}枚の画像のアップロードに失敗しました`);
				}
			} catch (error) {
				console.error("Image upload failed:", error);
				const message = error instanceof Error ? error.message : "画像のアップロードに失敗しました";
				toast.error(message);
			} finally {
				setIsUploading(false);
			}
		},
		[requestUploadInfos, uploadToStorage],
	);

	const handleFileChange = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>) => {
			setIsUploading(true);
			const files = event.target.files;
			if (!files || files.length === 0) return;

			const validFiles: File[] = [];

			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				if (!file.type.startsWith("image/")) {
					toast.error("画像ファイルではありません");
					continue;
				}
				if (file.type === "image/heic" || file.type === "image/heif") {
					toast.error("HEIC/HEIF形式の画像には対応していません");
					continue;
				}
				const compressedFile = await imageCompression(file, imageCompressionOptions);
				validFiles.push(compressedFile);
			}

			if (validFiles.length > 0) {
				await handleImageUpload(validFiles);
			}

			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		},
		[handleImageUpload],
	);

	const removeImage = useCallback((index: number) => {
		setUploadedImages((prev) => prev.filter((_, i) => i !== index));
	}, []);

	const resetImages = useCallback(() => {
		setUploadedImages([]);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}, []);

	useEffect(() => {
		if (uploadFetcher.state !== "idle" || !batchPendingRef.current) {
			return;
		}

		const pending = batchPendingRef.current;
		batchPendingRef.current = null;

		const data = uploadFetcher.data;
		if (data?.success && Array.isArray(data.uploads)) {
			pending.resolve(data.uploads);
			return;
		}

		const message = data?.message || "画像のアップロードに失敗しました";
		const error = new Error(message);
		toast.error(message);
		pending.reject(error);
	}, [uploadFetcher.data, uploadFetcher.state]);

	useEffect(() => {
		return () => {
			batchPendingRef.current = null;
		};
	}, []);

	return {
		fileInputRef,
		uploadedImages,
		setUploadedImages,
		handleFileChange,
		removeImage,
		resetImages,
		isUploading,
	};
};
