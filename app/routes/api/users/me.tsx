import type { LoaderFunctionArgs } from "react-router";
import { endpoints } from "~/constants/endpoints";
import { fetcher } from "~/lib/fetcher";
import type { UserInfo } from "~/types/user";

export async function loader({ request, context }: LoaderFunctionArgs) {
	try {
		const response = await fetcher(context, endpoints.users.me, {
			headers: {
				Cookie: request.headers.get("cookie") || "",
			},
		});

		if (!response.ok) {
			return new Response(null, { status: response.status });
		}

		const data = (await response.json()) as UserInfo | null;
		if (!data) return new Response(null, { status: 204 });

		return Response.json(data);
	} catch (error) {
		console.error("Failed to load user info:", error);
		return new Response(null, { status: 500 });
	}
}
