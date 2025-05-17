import { type RouteConfig, layout, prefix, route } from "@react-router/dev/routes";

export default [
	layout("layout/base.tsx", [route("/", "routes/top.tsx")]),

	...prefix("auth", [
		// login
		route("/login", "routes/auth/login.tsx"),
		// redirect
		route("/redirect", "routes/auth/redirect.tsx"),
		// logout
		route("/logout", "routes/auth/logout.tsx"),
		// auth callback
		route("/callback", "routes/auth/callback.tsx"),
	]),
] satisfies RouteConfig;
