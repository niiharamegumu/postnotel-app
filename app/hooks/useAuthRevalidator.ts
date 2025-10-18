import { useEffect, useRef } from "react";
import { useRevalidator } from "react-router";

/**
 * Force route loader revalidation on common resume events.
 * This keeps auth state fresh after tab backgrounding, mobile resume, or network changes.
 */
export function useAuthRevalidator() {
	const revalidator = useRevalidator();
	const lastRunRef = useRef<number>(0);
	const timeoutIdRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

	// Avoid magic numbers: throttle interval in ms
	const THROTTLE_INTERVAL_MS = 1000;
	const REVALIDATE_DELAY_MS = 500;

	useEffect(() => {
		const run = () => {
			const now = Date.now();
			if (now - lastRunRef.current < THROTTLE_INTERVAL_MS) return;
			lastRunRef.current = now;

			if (timeoutIdRef.current) {
				clearTimeout(timeoutIdRef.current);
			}

			timeoutIdRef.current = window.setTimeout(() => {
				timeoutIdRef.current = null;
				revalidator.revalidate();
			}, REVALIDATE_DELAY_MS);
		};

		const onVisibility = () => {
			if (document.visibilityState === "visible") run();
		};
		const onFocus = () => run();
		const onPageShow = () => run();
		const onOnline = () => run();

		document.addEventListener("visibilitychange", onVisibility);
		window.addEventListener("focus", onFocus);
		window.addEventListener("pageshow", onPageShow);
		window.addEventListener("online", onOnline);

		return () => {
			document.removeEventListener("visibilitychange", onVisibility);
			window.removeEventListener("focus", onFocus);
			window.removeEventListener("pageshow", onPageShow);
			window.removeEventListener("online", onOnline);
			if (timeoutIdRef.current) {
				clearTimeout(timeoutIdRef.current);
				timeoutIdRef.current = null;
			}
		};
	}, [revalidator]);
}
