import { AnimatePresence, motion } from "framer-motion";
import { Bot, ImagePlus, Loader2, X } from "lucide-react";
import { Suspense, useState } from "react";
import { Outlet, useOutletContext } from "react-router";
import { ImageZoomModal } from "~/components/common/ImageZoomModal";
import FloatMenu from "~/components/common/floatMenu";
import { Button } from "~/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerTrigger,
} from "~/components/ui/drawer";
import { useWineRecognition } from "~/features/wines/hooks/useWineRecognition";
import { useImageUpload } from "~/hooks/useImageUpload";
import { useImageZoom } from "~/hooks/useImageZoom";
import type { UserInfo } from "~/types/user";

export default function Wines() {
	const userInfo = useOutletContext<UserInfo | null>();
	const { fileInputRef, uploadedImages, handleFileChange, removeImage, resetImages, isUploading } =
		useImageUpload();
	const { recognizeWine, loading } = useWineRecognition();

	const [open, setOpen] = useState(false);
	const { isOpen, imageUrl, alt, overlayContent, openZoom, closeZoom } = useImageZoom();

	const requestAI = async (): Promise<void> => {
		try {
			await recognizeWine(uploadedImages);
			setOpen(false);
			resetImages();
		} catch (error) {
			console.error("ワインノートの作成に失敗:", error);
		}
	};

	return (
		<div className="flex flex-col min-h-screen">
			<main className="max-w-full pt-6 pb-25 px-4">
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
								<DrawerTrigger asChild>
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
															className="max-w-[50vw] max-h-[40vh] object-cover rounded md:max-h-[30vh] cursor-pointer"
															onClick={() => openZoom(imageUrl, `Uploaded ${index + 1}`)}
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
												disabled={isUploading}
												onClick={() => fileInputRef.current?.click()}
											>
												{isUploading ? (
													<span className="flex items-center gap-2 text-sm">
														画像をアップロード中...
													</span>
												) : (
													<ImagePlus />
												)}
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
												disabled={loading || uploadedImages.length === 0 || isUploading}
											>
												{isUploading ? "Uploading..." : loading ? "Request AI..." : "Request AI"}
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
			<ImageZoomModal
				isOpen={isOpen}
				onClose={closeZoom}
				imageUrl={imageUrl}
				alt={alt}
				overlayContent={overlayContent}
			/>
		</div>
	);
}
