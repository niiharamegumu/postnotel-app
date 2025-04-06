import LoginForm from "~/features/auth/components/loginForm";
import { fetcher } from "~/lib/fetcher";
import { redirect } from "react-router";

export async function action() {
	try {
		const response = await fetcher("http://localhost:8080/v1/auth/google/login");
		const data: LoginResponse = await response.json();

		if (!data.url) throw new Error("Login failed. No URL found in response.");
		return redirect(data.url, {
			headers: response.headers,
			status: response.status,
		});
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
