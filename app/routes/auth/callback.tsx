import { StatusCodes } from "http-status-codes";
import { useEffect } from "react";
import { redirect, useFetcher } from "react-router";
import { endpoints } from "~/constants/endpoints";
import { fetcher } from "~/lib/fetcher";
import type { Route } from "./+types/callback";

export async function action({ request, context }: Route.ActionArgs) {
	const formData = await request.formData();
	const code = formData.get("code");
	const state = formData.get("state");

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

		if (response.status === StatusCodes.OK) {
			return redirect("/", { headers: response.headers });
		}

		// エラーステータスに応じて異なるエラーを返す
		const errorCode = response.status >= StatusCodes.INTERNAL_SERVER_ERROR ? "server_error" : "auth_failed";
		console.log(`認証コールバックエラー: HTTP ${response.status}`);
		return redirect(`/auth/login?error=${errorCode}`);
	} catch (error) {
		console.log("認証コールバックエラー:", error);
		return redirect("/auth/login?error=network_error");
	}
}

export function loader() {
	return null;
}

export function meta() {
	return [{ title: "PostNotel" }, { name: "description", content: "Google認証処理中" }];
}

export default function Callback() {
	const submit = useFetcher();

	useEffect(() => {
		const url = new URL(window.location.href);
		const code = url.searchParams.get("code");
		const state = url.searchParams.get("state");

		if (code && state && submit.state === "idle" && !submit.data) {
			submit.submit({ code, state }, { method: "post", action: "/auth/callback" });
		}
	}, [submit]);

	return (
		<div className="h-screen flex flex-col justify-center items-center">
			<div className="text-xl mb-4">認証処理中</div>
		</div>
	);
}
