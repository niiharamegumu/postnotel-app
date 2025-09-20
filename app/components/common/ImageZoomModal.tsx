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
				className="w-screen max-w-[98vw] sm:max-w-[98vw] md:max-w-[98vw] lg:max-w-[98vw] xl:max-w-[98vw] 2xl:max-w-[98vw] max-h-[98vh] overflow-auto p-0 border-0 bg-transparent rounded-none"
				showCloseButton={false}
			>
				<div className="w-screen max-h-screen overflow-auto flex justify-center">
					<div className="relative">
						<img
							src={imageUrl}
							alt={alt}
							className="block w-screen h-screen object-contain"
							onClick={onClose}
						/>
						{overlayContent ? (
							<div className="absolute top-[6vh] md:top-0 left-1/2 flex -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-primary whitespace-nowrap">
								{overlayContent}
							</div>
						) : null}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
