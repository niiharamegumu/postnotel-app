import { useEffect } from "react";

type UseNoteDateKeyboardNavigationOptions = {
	onNavigate: (direction: "left" | "right") => void;
};

export const useNoteDateKeyboardNavigation = ({
	onNavigate,
}: UseNoteDateKeyboardNavigationOptions) => {
	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (!event.metaKey) {
				return;
			}

			const { target } = event;
			if (target instanceof HTMLElement) {
				const tagName = target.tagName.toLowerCase();
				const isFormElement = tagName === "input" || tagName === "textarea" || tagName === "select";
				if (isFormElement || target.isContentEditable) {
					return;
				}
			}

			if (event.key === "ArrowRight") {
				event.preventDefault();
				onNavigate("left");
				return;
			}

			if (event.key === "ArrowLeft") {
				event.preventDefault();
				onNavigate("right");
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [onNavigate]);
};
