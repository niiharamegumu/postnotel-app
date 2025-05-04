import { type RouteConfig, prefix, route } from "@react-router/dev/routes";

export default [
	route("/", "routes/top.tsx"),

	// ログイン
	...prefix("auth", [
		route("/login", "routes/auth/login.tsx"),
		// auth callback
		route("/callback", "routes/auth/callback.tsx"),
	]),
] satisfies RouteConfig;
