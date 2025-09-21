import type { ReactNode } from "react";
import { Dialog, DialogContent } from "~/components/ui/dialog";

interface ImageZoomModalProps {
	isOpen: boolean;
	onClose: () => void;
	imageUrl: string;
	alt: string;
	overlayContent?: ReactNode;
}

export function ImageZoomModal({
	isOpen,
	onClose,
	imageUrl,
	alt,
	overlayContent,
}: ImageZoomModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent
				className="top-0 left-1/2 h-screen w-screen max-h-none max-w-none -translate-1/2 translate-y-0 overflow-hidden p-0 border-0 bg-transparent rounded-none shadow-none"
				showCloseButton={false}
				onClick={onClose}
			>
				<div className="flex h-full w-full items-center justify-center overflow-hidden">
					<div className="relative">
						<img
							src={imageUrl}
							alt={alt}
							className="block max-h-full max-w-full object-contain"
							onClick={onClose}
						/>
						{overlayContent ? (
							<div className="pointer-events-none absolute bottom-0 right-0 flex justify-end">
								<div className="pointer-events-auto bg-white/50 px-3 py-1 text-sm whitespace-nowrap">
									{overlayContent}
								</div>
							</div>
						) : null}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
