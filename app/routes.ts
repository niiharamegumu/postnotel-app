import { type RouteConfig, layout, prefix, route } from "@react-router/dev/routes";

export default [
	layout("layout/base.tsx", [route("/", "routes/top.tsx")]),

	// notes
	layout("layout/withPost.tsx", [...prefix("notes", [route("/", "routes/notes/index.tsx")])]),
	...prefix("notes", [
		// create
		route("/create", "routes/notes/create.tsx"),
		// update
		route("/:id/update", "routes/notes/update.tsx"),
		// delete
		route("/:id/delete", "routes/notes/delete.tsx"),
	]),

	// image
	...prefix("image", [
		// get upload URL
		route("/get-upload-url", "routes/image/getUploadUrl.tsx"),
	]),

	layout("layout/wines.tsx", [route("/wines", "routes/wines/index.tsx")]),
	...prefix("wines", [route("/recognize", "routes/wines/recognize.tsx")]),

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
