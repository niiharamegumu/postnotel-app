import { Bot, ImagePlus, X } from "lucide-react";
import { Suspense, useState, useRef } from "react";
import { Outlet, useNavigate, useOutletContext } from "react-router";
import FloatMenu from "~/components/common/floatMenu";
import { Button } from "~/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerTrigger,
} from "~/components/ui/drawer";
import { motion, AnimatePresence } from "framer-motion";
import type { UserInfo } from "~/types/user";
import imageCompression from "browser-image-compression";
import { imageCompressionOptions } from "~/constants/imageFile";
import { toast } from "sonner";
import type { UploadUrlResponse } from "~/features/image/types/image";
import { ApiResponseError } from "~/api/error/apiResponseError";
import { AccessLevel } from "~/constants/accessLevel";
import { format } from "date-fns";

export default function Wines() {
	const navigate = useNavigate();

	const userInfo = useOutletContext<UserInfo | null>();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [open, setOpen] = useState(false);
	const [uploadedImages, setUploadedImages] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);

	const requestAI = async (): Promise<void> => {
		setLoading(true);
		try {
			const noteDay = format(new Date(), "yyyy-MM-dd");
			const accessLevel = AccessLevel.Public;
			const imagesFileNames = uploadedImages.map((url) => {
				const parts = url.split("/");
				return parts[parts.length - 1];
			});
			const body = JSON.stringify({
				noteDay,
				accessLevel,
				images: imagesFileNames,
			});

			const res = await fetch("/wines/recognize", {
				method: "POST",
				body,
			});
			if (!res.ok) {
				throw new ApiResponseError(res.status, "処理に失敗しました");
			}

			navigate("/wines");
			toast.success("ワインノートの作成をAIへリクエストしました");
		} catch (error) {
			if (error instanceof ApiResponseError) {
				toast.error(error.message);
			} else {
				console.error("ワインノートの作成に失敗:", error);
				toast.error("ワインノートの作成に失敗しました");
			}
		} finally {
			setLoading(false);
			setOpen(false);
			setUploadedImages([]);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	// 単一画像のアップロード処理
	const handleSingleImageUpload = async (file: File) => {
		try {
			// ファイル名から拡張子を取得
			const fileNameParts = file.name.split(".");
			const ext =
				fileNameParts.length > 1 ? fileNameParts[fileNameParts.length - 1].toLowerCase() : "";

			// Content-Typeを取得
			const contentType = file.type;

			// 画像アップロードURL取得（URLパラメータを追加）
			const getUrlResponse = await fetch(
				`/image/get-upload-url?ext=${encodeURIComponent(ext)}&contentType=${encodeURIComponent(contentType)}`,
			);

			if (!getUrlResponse.ok) {
				throw new Error("Failed to get upload URL");
			}

			const uploadData = (await getUrlResponse.json()) as UploadUrlResponse;

			// 画像アップロード
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

			// 画像URLを配列に追加
			setUploadedImages((prev) => [...prev, imageUrl]);

			return imageUrl;
		} catch (error) {
			console.error("Image upload failed:", error);
			toast.error("画像のアップロードに失敗しました");
			return null;
		}
	};

	// 複数画像アップロード処理
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

	// ファイル選択時の処理
	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files || files.length === 0) return;

		const validFiles: File[] = [];

		// 各ファイルを検証
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			if (!file.type.startsWith("image/")) {
				toast.error("画像ファイルではありません");
				continue;
			}
			// heicやheif形式の画像はブラウザで直接扱えないため、スキップ
			if (file.type === "image/heic" || file.type === "image/heif") {
				toast.error("HEIC/HEIF形式の画像には対応していません");
				continue;
			}
			const compressedFile = await imageCompression(file, imageCompressionOptions);

			validFiles.push(compressedFile);
		}

		// 有効なファイルがあればアップロード処理
		if (validFiles.length > 0) {
			handleImageUpload(validFiles);
		}

		// ファイル選択をリセット（同じファイルを再選択できるように）
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// 特定の画像を削除する関数
	const removeImage = (index: number) => {
		setUploadedImages((prev) => prev.filter((_, i) => i !== index));
	};

	return (
		<div className="flex flex-col min-h-screen">
			<main className="max-w-full pt-6 pb-25 px-6">
				<Outlet context={userInfo} />
				<div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center gap-2">
					<FloatMenu userInfo={userInfo} />
					{userInfo && (
						<Suspense
							fallback={
								<Button className="w-[48px]">
									<Bot />
								</Button>
							}
						>
							<Drawer
								open={open}
								onOpenChange={(isOpen) => {
									setOpen(isOpen);
								}}
							>
								<DrawerTrigger>
									<Button>
										<AnimatePresence mode="wait" initial={false}>
											<motion.span
												key={open ? "close" : "Bot"}
												initial={{ opacity: 0, scale: 0.7 }}
												animate={{ opacity: 1, scale: 1 }}
												exit={{ opacity: 0, scale: 0.7 }}
												transition={{ duration: 0.18, ease: "easeInOut" }}
											>
												{open ? <X /> : <Bot />}
											</motion.span>
										</AnimatePresence>
									</Button>
								</DrawerTrigger>
								<DrawerContent className="w-full h-[50vh] px-4">
									<div className="flex flex-nowrap gap-2 overflow-x-auto">
										{uploadedImages.length > 0 && (
											<div className="w-full p-2 flex justify-start flex-nowrap items-center gap-2 pt-6">
												{uploadedImages.map((imageUrl, index) => (
													<div key={imageUrl} className="rounded p-1 relative shrink-0">
														<img
															src={imageUrl}
															alt={`Uploaded ${index + 1}`}
															className="max-w-[50vw] max-h-[40vh] object-cover rounded md:max-h-[30vh]"
														/>
														<button
															type="button"
															onClick={() => removeImage(index)}
															className="absolute -top-2 -right-2 text-secondary rounded-full p-1 bg-muted-foreground"
															aria-label="Remove image"
														>
															<X size={30} />
														</button>
													</div>
												))}
											</div>
										)}
									</div>

									<DrawerFooter className="flex items-center flex-row justify-between">
										<div className="flex items-center gap-2">
											<Button
												variant="outline"
												type="button"
												onClick={() => fileInputRef.current?.click()}
											>
												<ImagePlus />
											</Button>
											<input
												ref={fileInputRef}
												type="file"
												accept="image/*"
												multiple
												onChange={handleFileChange}
												className="hidden"
											/>
										</div>
										<div className="flex items-center gap-2">
											<Button variant="default" onClick={requestAI} disabled={loading}>
												{loading ? "Request AI..." : "Request AI"}
											</Button>
											<DrawerClose>
												<Button variant="outline">Cancel</Button>
											</DrawerClose>
										</div>
									</DrawerFooter>
								</DrawerContent>
							</Drawer>
						</Suspense>
					)}
				</div>
			</main>
		</div>
	);
}
