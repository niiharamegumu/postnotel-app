import LoginForm from "~/features/auth/components/loginForm";
import { fetcher } from "~/lib/fetcher";
import { redirect } from "react-router";
import type { Route } from "./+types/login";
import { endpoints } from "~/constants/endpoints";
import type { LoginResponse } from "~/features/auth/types/response";

export async function action({ context }: Route.ActionArgs) {
	try {
		const response = await fetcher(context, endpoints.auth.login);
		const data: LoginResponse = await response.json();

		if (!data.url) throw new Error("Login failed. No URL found in response.");
		console.log("Header:", response.headers);
		console.log("Status:", response.status);
		return redirect(data.url, { headers: response.headers });
	} catch (error) {
		console.error("Login error:", error);
		throw error;
	}
}

export function meta() {
	return [{ title: "PostNotel_Login" }, { name: "description", content: "PostNotel Login" }];
}

export default function Login() {
	return <LoginForm />;
}
