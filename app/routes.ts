import { type RouteConfig, prefix, route } from "@react-router/dev/routes";

export default [
	route("/", "routes/top.tsx"),

	...prefix("auth", [
		// login
		route("/login", "routes/auth/login.tsx"),
		// logout
		route("/logout", "routes/auth/logout.tsx"),
		// auth callback
		route("/callback", "routes/auth/callback.tsx"),
	]),
] satisfies RouteConfig;
