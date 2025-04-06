import { type RouteConfig, prefix, route } from "@react-router/dev/routes";

export default [
	route("/", "routes/top.tsx"),
	route("/home", "routes/home.tsx"),

	// ログイン・ログアウト
	...prefix("auth", [route("/login", "routes/auth/login.tsx")]),
] satisfies RouteConfig;
