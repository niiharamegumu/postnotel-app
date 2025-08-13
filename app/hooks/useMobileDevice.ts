import { useCallback, useEffect, useState } from "react";

type DeviceDetection = {
	isMobileDevice: boolean;
	isTouchPrimary: boolean;
	hasTouchPoints: boolean;
	isCoarsePointer: boolean;
};

/**
 * Pure function for device detection (testable)
 */
export const detectDeviceCharacteristics = (): DeviceDetection => {
	let hasTouchPoints = false;
	let isCoarsePointer = false;
	let userAgentMobile = false;

	try {
		// Check touch points capability
		if (typeof navigator !== "undefined" && "maxTouchPoints" in navigator) {
			hasTouchPoints = navigator.maxTouchPoints > 0;
		}
	} catch (error) {
		console.warn("Failed to check touch points:", error);
	}

	try {
		// Check pointer type via media query
		if (typeof window !== "undefined" && window.matchMedia) {
			const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
			isCoarsePointer = coarsePointerQuery.matches;
		}
	} catch (error) {
		console.warn("Failed to check pointer type:", error);
	}

	try {
		// Fallback to user agent (last resort)
		if (typeof navigator !== "undefined" && navigator.userAgent) {
			userAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
				navigator.userAgent,
			);
		}
	} catch (error) {
		console.warn("Failed to check user agent:", error);
	}

	const isTouchPrimary = hasTouchPoints && isCoarsePointer;
	const isMobileDevice = isTouchPrimary || (hasTouchPoints && userAgentMobile) || isCoarsePointer;

	return {
		isMobileDevice,
		isTouchPrimary,
		hasTouchPoints,
		isCoarsePointer,
	};
};

/**
 * Hook for detecting mobile devices with SSR safety and real-time updates
 */
export const useMobileDevice = (): DeviceDetection => {
	// SSR-safe initial state (conservative false)
	const [deviceState, setDeviceState] = useState<DeviceDetection>({
		isMobileDevice: false,
		isTouchPrimary: false,
		hasTouchPoints: false,
		isCoarsePointer: false,
	});

	const updateDeviceState = useCallback(() => {
		setDeviceState(detectDeviceCharacteristics());
	}, []);

	useEffect(() => {
		// Update state after hydration
		updateDeviceState();

		// Listen for pointer media query changes
		let mediaQueryList: MediaQueryList | null = null;

		try {
			if (typeof window !== "undefined" && window.matchMedia) {
				mediaQueryList = window.matchMedia("(pointer: coarse)");
				mediaQueryList.addEventListener("change", updateDeviceState);
			}
		} catch (error) {
			console.warn("Failed to set up media query listener:", error);
		}

		// Cleanup
		return () => {
			try {
				if (mediaQueryList) {
					mediaQueryList.removeEventListener("change", updateDeviceState);
				}
			} catch (error) {
				console.warn("Failed to clean up media query listener:", error);
			}
		};
	}, [updateDeviceState]);

	return deviceState;
};
