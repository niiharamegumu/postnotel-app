import { useNavigation as useReactRouterNavigation } from "react-router";

export type NavigationState = {
	isLoading: boolean;
	isIdle: boolean;
	isSubmitting: boolean;
};

export function useNavigation(): NavigationState {
	const navigation = useReactRouterNavigation();

	return {
		isLoading: navigation.state === "loading",
		isIdle: navigation.state === "idle",
		isSubmitting: navigation.state === "submitting",
	};
}
