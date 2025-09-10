import { Dialog, DialogContent } from "~/components/ui/dialog";

interface ImageZoomModalProps {
	isOpen: boolean;
	onClose: () => void;
	imageUrl: string;
	alt: string;
}

export function ImageZoomModal({ isOpen, onClose, imageUrl, alt }: ImageZoomModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent
				className="w-screen max-w-[98vw] sm:max-w-[98vw] md:max-w-[98vw] lg:max-w-[98vw] xl:max-w-[98vw] 2xl:max-w-[98vw] max-h-[98vh] overflow-auto p-0 border-0 bg-transparent rounded-none"
				showCloseButton={false}
			>
				<div className="relative w-screen max-h-screen overflow-auto flex justify-center">
					<img
						src={imageUrl}
						alt={alt}
						className="w-screen h-auto object-contain"
						onClick={onClose}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
