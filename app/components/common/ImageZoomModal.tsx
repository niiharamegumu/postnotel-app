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
				className="max-w-[95vw] max-h-[95vh] p-0 border-0 bg-transparent"
				showCloseButton={false}
			>
				<div className="relative w-full h-full flex items-center justify-center">
					<img
						src={imageUrl}
						alt={alt}
						className="max-w-full max-h-full object-contain"
						onClick={onClose}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
