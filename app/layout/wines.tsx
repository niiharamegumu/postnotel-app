import { Bot, ImagePlus, X } from "lucide-react";
import { Suspense, useState } from "react";
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
import { toast } from "sonner";
import { ApiResponseError } from "~/api/error/apiResponseError";
import { AccessLevel } from "~/constants/accessLevel";
import { format } from "date-fns";
import { useImageUpload } from "~/hooks/useImageUpload";
import { StatusCodes } from "http-status-codes";

export default function Wines() {
	const navigate = useNavigate();

	const userInfo = useOutletContext<UserInfo | null>();
	const { fileInputRef, uploadedImages, handleFileChange, removeImage, resetImages } =
		useImageUpload();

	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	const requestAI = async (): Promise<void> => {
		if (uploadedImages.length === 0) {
			toast.error("画像を選択してください");
			return;
		}

		setLoading(true);
		try {
			const noteDay = format(new Date(), "yyyy-MM-dd");
			const accessLevel = AccessLevel.Public;
			const imagesFileNames = uploadedImages.map((url) => {
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

			const res = await fetch("/wines/recognize", {
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
		} catch (error) {
			console.error("ワインノートの作成に失敗:", error);

			if (error instanceof ApiResponseError) {
				toast.error(error.message);
			} else if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("ワインノートの作成に失敗しました");
			}
		} finally {
			setLoading(false);
			setOpen(false);
			resetImages();
		}
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
								<Button className="border-solid border-secondary border-1">
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
									<Button className="border-solid border-secondary border-1">
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
											<Button
												variant="default"
												onClick={requestAI}
												disabled={loading || uploadedImages.length === 0}
											>
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
