import { useCallback, useEffect, useRef } from "react";
import { useRevalidator } from "react-router";

/**
 * Force route loader revalidation on common resume events.
 * This keeps auth state fresh after tab backgrounding, mobile resume, or network changes.
 */
export function useAuthRevalidator() {
	const revalidator = useRevalidator();
	const lastRunRef = useRef<number>(0);

	// Avoid magic numbers: throttle interval in ms
	const THROTTLE_INTERVAL_MS = 1000;

	const run = useCallback(() => {
		if (typeof navigator !== "undefined" && !navigator.onLine) return;

		const now = Date.now();
		if (now - lastRunRef.current < THROTTLE_INTERVAL_MS) return;
		lastRunRef.current = now;
		revalidator.revalidate();
	}, [revalidator]);

	useEffect(() => {
		run();

		const onVisibility = () => {
			if (document.visibilityState === "visible") run();
		};
		const onFocus = () => run();
		const onPageShow = () => run();
		const onOnline = () => run();
		const onConnectionChange = () => run();

		const navigatorWithConnection = navigator as Navigator & {
			connection?: {
				addEventListener?: (type: string, listener: () => void) => void;
				removeEventListener?: (type: string, listener: () => void) => void;
			};
		};

		document.addEventListener("visibilitychange", onVisibility);
		window.addEventListener("focus", onFocus);
		window.addEventListener("pageshow", onPageShow);
		window.addEventListener("online", onOnline);
		navigatorWithConnection.connection?.addEventListener?.("change", onConnectionChange);

		return () => {
			document.removeEventListener("visibilitychange", onVisibility);
			window.removeEventListener("focus", onFocus);
			window.removeEventListener("pageshow", onPageShow);
			window.removeEventListener("online", onOnline);
			navigatorWithConnection.connection?.removeEventListener?.("change", onConnectionChange);
		};
	}, [run]);
}
