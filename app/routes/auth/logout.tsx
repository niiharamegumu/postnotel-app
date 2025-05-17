import { fetcher } from "~/lib/fetcher";
import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { endpoints } from "~/constants/endpoints";
import { StatusCodes } from "http-status-codes";

export async function loader({ request, context }: LoaderFunctionArgs) {
	const userInfo = context.userInfo;
	if (!userInfo) {
		console.log("User is not logged in.");
		return redirect("/");
	}
	try {
		const response = await fetcher(context, endpoints.auth.logout, {
			headers: {
				Cookie: request.headers.get("cookie") || "",
			},
			method: "POST",
		});

		if (response.status === StatusCodes.UNAUTHORIZED) {
			console.log("User is not logged in.");
			return redirect("/auth/login");
		}

		if (!response.ok) {
			throw new Error(`Logout failed with status: ${response.status}`);
		}
		// ログアウト成功後はトップページにリダイレクト
		return redirect("/", { headers: response.headers });
	} catch (error) {
		console.log("Logout error:", error);
		throw error;
	}
}
export function meta() {
	return [{ title: "PostNotel_Logout" }, { name: "description", content: "PostNotel Logout" }];
}

// このコンポーネントは直接表示されることはありませんが、念のために追加
export default function Logout() {
	return <div>Logging out...</div>;
}
