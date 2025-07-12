import { useState, useRef } from "react";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";
import { imageCompressionOptions } from "~/constants/imageFile";
import type { UploadUrlResponse } from "~/features/image/types/image";

export const useImageUpload = () => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [uploadedImages, setUploadedImages] = useState<string[]>([]);

	const handleSingleImageUpload = async (file: File): Promise<string | null> => {
		try {
			const fileNameParts = file.name.split(".");
			const ext =
				fileNameParts.length > 1 ? fileNameParts[fileNameParts.length - 1].toLowerCase() : "";

			const contentType = file.type;

			const getUrlResponse = await fetch(
				`/api/image/get-upload-url?ext=${encodeURIComponent(ext)}&contentType=${encodeURIComponent(contentType)}`,
			);

			if (!getUrlResponse.ok) {
				throw new Error("Failed to get upload URL");
			}

			const uploadData = (await getUrlResponse.json()) as UploadUrlResponse;

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

			return imageUrl;
		} catch (error) {
			console.error("Image upload failed:", error);
			toast.error("画像のアップロードに失敗しました");
			return null;
		}
	};

	const handleImageUpload = async (files: File[]) => {
		let successCount = 0;

		for (const file of files) {
			const result = await handleSingleImageUpload(file);
			if (result) successCount++;
		}

		if (successCount > 0) {
			toast.success(`${successCount}枚の画像をアップロードしました`);
		}
	};

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
	};

	const removeImage = (index: number) => {
		setUploadedImages((prev) => prev.filter((_, i) => i !== index));
	};

	const resetImages = () => {
		setUploadedImages([]);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return {
		fileInputRef,
		uploadedImages,
		setUploadedImages,
		handleFileChange,
		removeImage,
		resetImages,
	};
};