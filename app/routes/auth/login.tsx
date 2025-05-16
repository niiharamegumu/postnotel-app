import LoginForm from "~/features/auth/components/loginForm";
import { fetcher } from "~/lib/fetcher";
import { redirect } from "react-router";
import type { Route } from "./+types/login";
import { endpoints } from "~/constants/endpoints";
import type { LoginResponse } from "~/features/auth/types/response";
import { StatusCodes } from "http-status-codes";

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

		const data: LoginResponse = await response.json();
		if (!data.url) throw new Error("Login failed. No URL found in response.");

		return redirect(`/auth/redirect?target=${encodeURIComponent(data.url)}`, {
			headers: {
				Cookie: response.headers.get("set-cookie") || "",
			},
		});
	} catch (error) {
		console.log("Login error:", error);
		throw error;
	}
}

export function meta() {
	return [{ title: "PostNotel Login" }, { name: "description", content: "PostNotel Login" }];
}

export default function Login() {
	return <LoginForm />;
}
