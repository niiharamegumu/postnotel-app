import { redirect, useFetcher } from "react-router";
import { useEffect } from "react";
import { fetcher } from "~/lib/fetcher";
import { endpoints } from "~/constants/endpoints";
import type { Route } from "./+types/callback";

export async function action({ request, context }: Route.ActionArgs) {
	// postなのでbodyからcode, stateを取得
	const formData = await request.formData();
	const code = formData.get("code");
	const state = formData.get("state");
	// codeとstateパラメータが存在するか確認
	if (!code || !state) {
		console.log("認証エラー: codeまたはstateが不足しています");
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
	const submit = useFetcher();

	useEffect(() => {
		// URLからcode, stateを取得
		const url = new URL(window.location.href);
		const code = url.searchParams.get("code");
		const state = url.searchParams.get("state");

		if (code && state && submit.state === "idle" && !submit.data) {
			// actionにパラメータを渡す
			submit.submit({ code, state }, { method: "post", action: "/auth/callback" });
		}
	}, [submit]);

	return (
		<div className="h-screen flex flex-col justify-center items-center">
			<div className="text-xl mb-4">認証処理中</div>
		</div>
	);
}
