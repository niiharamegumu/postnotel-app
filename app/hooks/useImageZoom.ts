import { useState } from "react";

interface UseImageZoomReturn {
	isOpen: boolean;
	imageUrl: string;
	alt: string;
	openZoom: (url: string, altText: string) => void;
	closeZoom: () => void;
}

export function useImageZoom(): UseImageZoomReturn {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [imageUrl, setImageUrl] = useState<string>("");
	const [alt, setAlt] = useState<string>("");

	const openZoom = (url: string, altText: string): void => {
		setImageUrl(url);
		setAlt(altText);
		setIsOpen(true);
	};

	const closeZoom = (): void => {
		setIsOpen(false);
		setImageUrl("");
		setAlt("");
	};

	return {
		isOpen,
		imageUrl,
		alt,
		openZoom,
		closeZoom,
	};
}