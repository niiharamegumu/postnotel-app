import { useCallback, useEffect } from "react";

type UseKeyboardSubmitOptions = {
	enabled: boolean;
	onSubmit: () => void | Promise<void>;
};

export const useKeyboardSubmit = ({ enabled, onSubmit }: UseKeyboardSubmitOptions) => {
	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
				event.preventDefault();
				onSubmit();
			}
		},
		[onSubmit],
	);

	useEffect(() => {
		if (enabled) {
			document.addEventListener("keydown", handleKeyDown);
		}

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [enabled, handleKeyDown]);
};
