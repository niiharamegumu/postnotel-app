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
		console.log("認証エラー: codeまたはstateが不足しています");
		return redirect("/auth/login");
	}

	try {
		const cookie = request.headers.get("cookie");
		// TODO: 消す
		console.log(cookie);
		if (!cookie) {
			console.log("認証エラー: Cookieが存在しません");
			return redirect("/auth/login");
		}
		const response = await fetcher(
			context,
			`${endpoints.auth.callback}?code=${code}&state=${state}`,
			{
				headers: {
					Cookie: cookie,
				},
			},
		);

		if (response.ok) {
			return redirect("/", { headers: response.headers });
		}

		return redirect("/auth/login");
	} catch (error) {
		console.log("認証コールバックエラー:", error);
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
