import { StatusCodes } from "http-status-codes";
import { redirect, useLoaderData } from "react-router";
import { endpoints } from "~/constants/endpoints";
import LoginForm from "~/features/auth/components/loginForm";
import type { LoginResponse } from "~/features/auth/types/response";
import { fetcher } from "~/lib/fetcher";
import type { Route } from "./+types/login";

type LoaderData = {
	error: string | null;
};

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
	const url = new URL(request.url);
	const errorParam = url.searchParams.get("error");

	return { error: errorParam };
}

export async function action({ request, context }: Route.ActionArgs) {
	try {
		const response = await fetcher(context, endpoints.auth.login, {
			headers: {
				Cookie: request.headers.get("cookie") || "",
			},
		});

		if (response.status === StatusCodes.CONFLICT) {
			console.log("User is already logged in.");
			return redirect("/");
		}

		if (!response.ok) {
			const errorCode = response.status >= 500 ? "server_error" : "login_failed";
			console.log(`Login error: HTTP ${response.status}`);
			return redirect(`/auth/login?error=${errorCode}`);
		}

		const data: LoginResponse = await response.json();
		if (!data.url) {
			console.log("Login failed. No URL found in response.");
			return redirect("/auth/login?error=invalid_response");
		}

		return redirect(`/api/auth/redirect?target=${encodeURIComponent(data.url)}`, {
			headers: response.headers,
		});
	} catch (error) {
		console.log("Login error:", error);
		return redirect("/auth/login?error=network_error");
	}
}

export function meta() {
	return [{ title: "PostNotel Login" }, { name: "description", content: "PostNotel Login" }];
}

export default function Login() {
	const { error } = useLoaderData<LoaderData>();

	return <LoginForm error={error} />;
}
