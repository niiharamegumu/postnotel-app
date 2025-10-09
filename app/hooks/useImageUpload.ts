import imageCompression from "browser-image-compression";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import { imageCompressionOptions } from "~/constants/imageFile";
import type { UploadUrlResponse } from "~/features/image/types/image";

export const useImageUpload = () => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [uploadedImages, setUploadedImages] = useState<string[]>([]);
	const uploadFetcher = useFetcher<{
		success: boolean;
		upload?: UploadUrlResponse;
		message?: string;
	}>();
	const pendingRef = useRef<{
		file: File;
		resolve: (value: string | null) => void;
	} | null>(null);

	const handleSingleImageUpload = useCallback(
		async (file: File): Promise<string | null> => {
			try {
				const fileNameParts = file.name.split(".");
				const ext =
					fileNameParts.length > 1 ? fileNameParts[fileNameParts.length - 1].toLowerCase() : "";

				const contentType = file.type;
				const query = `/api/image/get-upload-url?ext=${encodeURIComponent(ext)}&contentType=${encodeURIComponent(contentType)}`;

				return await new Promise<string | null>((resolve) => {
					pendingRef.current = { file, resolve };
					uploadFetcher.load(query);
				});
			} catch (error) {
				console.error("Image upload failed:", error);
				toast.error("画像のアップロードに失敗しました");
				return null;
			}
		},
		[uploadFetcher],
	);

	const handleImageUpload = useCallback(
		async (files: File[]) => {
			let successCount = 0;

			for (const file of files) {
				const result = await handleSingleImageUpload(file);
				if (result) successCount++;
			}

			if (successCount > 0) {
				toast.success(`${successCount}枚の画像をアップロードしました`);
			}
		},
		[handleSingleImageUpload],
	);

	const handleFileChange = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>) => {
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
				handleImageUpload(validFiles);
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
		if (uploadFetcher.state !== "idle" || !pendingRef.current) {
			return;
		}

		const pending = pendingRef.current;
		pendingRef.current = null;

		const data = uploadFetcher.data;
		if (!data?.success || !data.upload) {
			console.error("Image upload failed: invalid response", data);
			toast.error(data?.message || "画像のアップロードに失敗しました");
			pending.resolve(null);
			return;
		}

		const uploadData = data.upload;
		const { file } = pending;

		void (async () => {
			try {
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

				const imageUrl = `${uploadData.storageBaseUrl}/temporary/${uploadData.fileName}`;
				setUploadedImages((prev) => [...prev, imageUrl]);
				pending.resolve(imageUrl);
			} catch (error) {
				console.error("Image upload failed:", error);
				toast.error("画像のアップロードに失敗しました");
				pending.resolve(null);
			}
		})();
	}, [uploadFetcher.data, uploadFetcher.state]);

	useEffect(() => {
		return () => {
			pendingRef.current = null;
		};
	}, []);

	return {
		fileInputRef,
		uploadedImages,
		setUploadedImages,
		handleFileChange,
		removeImage,
		resetImages,
	};
};
