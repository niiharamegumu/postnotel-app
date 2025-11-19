import { redirect } from "react-router";
import { endpoints } from "~/constants/endpoints";
import { fetcher } from "~/lib/fetcher";
import type { Route } from "./+types/callback";

export async function loader({ request, context }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");

	// codeとstateパラメータが存在するか確認
	if (!code || !state) {
		console.log("認証エラー: codeまたはstateが不足しています");
		return redirect("/auth/login?error=missing_params");
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
			return redirect("/", { headers: response.headers });
		}

		// エラーステータスに応じて異なるエラーを返す
		const errorCode = response.status >= 500 ? "server_error" : "auth_failed";
		console.log(`認証コールバックエラー: HTTP ${response.status}`);
		return redirect(`/auth/login?error=${errorCode}`);
	} catch (error) {
		console.log("認証コールバックエラー:", error);
		return redirect("/auth/login?error=network_error");
	}
}

export function meta() {
	return [{ title: "PostNotel" }, { name: "description", content: "Google認証処理中" }];
}

export default function Callback() {
	return (
		<div className="h-screen flex flex-col justify-center items-center">
			<div className="text-xl mb-4">認証処理中</div>
		</div>
	);
}
