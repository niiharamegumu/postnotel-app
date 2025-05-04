import { redirect } from "react-router";
import { fetcher } from "~/lib/fetcher";
import { endpoints } from "~/constants/endpoints";
import type { Route } from "./+types/callback";

export async function loader({ request, context }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");

	// codeとstateパラメータが存在するか確認
	if (!code || !state) {
		console.error("認証エラー: codeまたはstateが不足しています");
		return redirect("/auth/login");
	}

	try {
		const response = await fetcher(
			context,
			`${endpoints.auth.callback}?code=${code}&state=${state}`,
			{
				headers: {
					Cookie: request.headers.get("cookie") || "",
				},
			},
		);

		if (response.ok) {
			console.log("認証成功:", response);
			return redirect("/");
		}

		return redirect("/auth/login");
	} catch (error) {
		console.error("認証コールバックエラー:", error);
		return redirect("/auth/login");
	}
}

export function meta() {
	return [{ title: "PostNotel" }, { name: "description", content: "Google認証処理中" }];
}

export default function Callback() {
	return (
		<div className="h-screen flex flex-col justify-center items-center">
			<div className="text-xl mb-4">認証処理中...</div>
		</div>
	);
}
