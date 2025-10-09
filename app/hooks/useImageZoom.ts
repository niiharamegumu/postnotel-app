import { type ReactNode, useState } from "react";

interface UseImageZoomReturn {
	isOpen: boolean;
	imageUrl: string;
	alt: string;
	overlayContent: ReactNode | null;
	openZoom: (url: string, altText: string, content?: ReactNode) => void;
	closeZoom: () => void;
}

export function useImageZoom(): UseImageZoomReturn {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [imageUrl, setImageUrl] = useState<string>("");
	const [alt, setAlt] = useState<string>("");
	const [overlayContent, setOverlayContent] = useState<ReactNode | null>(null);

	const openZoom = (url: string, altText: string, content?: ReactNode): void => {
		setImageUrl(url);
		setAlt(altText);
		setOverlayContent(content ?? null);
		setIsOpen(true);
	};

	const closeZoom = (): void => {
		setIsOpen(false);
		setImageUrl("");
		setAlt("");
		setOverlayContent(null);
	};

	return {
		isOpen,
		imageUrl,
		alt,
		overlayContent,
		openZoom,
		closeZoom,
	};
}
