import { type RouteConfig, layout, prefix, route } from "@react-router/dev/routes";

export default [
	layout("layout/base.tsx", [
		route("/", "routes/top.tsx"),

		...prefix("notes", [
			route("/tag/:tagId", "routes/notes/tag.tsx"),
			route("/images", "routes/notes/images.tsx"),
		]),
	]),

	// notes
	layout("layout/withPost.tsx", [...prefix("notes", [route("/", "routes/notes/index.tsx")])]),

	// wines
	layout("layout/wines.tsx", [route("/wines", "routes/wines/index.tsx")]),

	// auth
	...prefix("auth", [
		route("/login", "routes/auth/login.tsx"),
		route("/callback", "routes/auth/callback.tsx"),
	]),

	// ====== Start of BFF API endpoints =====
	...prefix("api", [
		...prefix("image", [route("/get-upload-url", "routes/api/image/get-upload-url.tsx")]),

		...prefix("notes", [
			route("/create", "routes/api/notes/create.tsx"),
			route("/:id/update", "routes/api/notes/update.tsx"),
			route("/:id/delete", "routes/api/notes/delete.tsx"),
		]),

		route("/note-days", "routes/api/note-days/index.ts"),

		...prefix("wines", [route("/recognize", "routes/api/wines/recognize.tsx")]),

		...prefix("tags", [
			route("/", "routes/api/tags/index.tsx"),
			route("/create", "routes/api/tags/create.tsx"),
		]),

		...prefix("auth", [
			route("/redirect", "routes/api/auth/redirect.tsx"),
			route("/logout", "routes/api/auth/logout.tsx"),
		]),
	]),
	// ====== End of BFF API endpoints =====
] satisfies RouteConfig;
