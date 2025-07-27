import { useEffect } from "react";

/**
 * スマートフォンブラウザのページバック操作を無効化するカスタムフック
 * 水平スワイプ時のページバックを防ぎ、垂直スクロールは正常に動作させる
 */
export const usePreventBackNavigation = () => {
	useEffect(() => {
		const handlePopState = (event: PopStateEvent) => {
			event.preventDefault();
			return false;
		};

		const handleTouchStart = (event: TouchEvent) => {
			if (event.touches.length > 1) return;

			const touch = event.touches[0];
			const startX = touch.clientX;
			const startY = touch.clientY;

			const handleTouchMove = (moveEvent: TouchEvent) => {
				if (moveEvent.touches.length > 1) return;

				const moveTouch = moveEvent.touches[0];
				const deltaX = moveTouch.clientX - startX;
				const deltaY = moveTouch.clientY - startY;

				// 水平スワイプの場合のみページバックを防ぐ
				if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
					moveEvent.preventDefault();
				}
			};

			const handleTouchEnd = () => {
				document.removeEventListener("touchmove", handleTouchMove);
				document.removeEventListener("touchend", handleTouchEnd);
			};

			document.addEventListener("touchmove", handleTouchMove, { passive: false });
			document.addEventListener("touchend", handleTouchEnd);
		};

		// popstateイベントを監視してページバックを防ぐ
		window.addEventListener("popstate", handlePopState);

		// touchイベントでページバックを防ぐ
		document.addEventListener("touchstart", handleTouchStart, { passive: false });

		return () => {
			window.removeEventListener("popstate", handlePopState);
			document.removeEventListener("touchstart", handleTouchStart);
		};
	}, []);
};
