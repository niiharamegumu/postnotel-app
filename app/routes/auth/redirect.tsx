import { redirect } from "react-router";
import type { Route } from "./+types/redirect";

export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const target = url.searchParams.get("target");

	// TODO:消す
	console.log(target);
	const cookie = request.headers.get("cookie");
	console.log(cookie);

	if (!target) return redirect("/auth/login");
	return redirect(target);
}

export function meta() {
	return [{ title: "PostNotel Login" }, { name: "description", content: "PostNotel Login" }];
}

export default function Redirect() {
	return null;
}
