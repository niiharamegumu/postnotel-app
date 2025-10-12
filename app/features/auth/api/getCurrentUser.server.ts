import type { AppLoadContext } from "react-router";
import { endpoints } from "~/constants/endpoints";
import { fetcher } from "~/lib/fetcher";
import type { UserInfo } from "~/types/user";

export type FetchCurrentUserArgs = {
	request: Request;
	context: AppLoadContext;
};

export type FetchCurrentUserResult =
	| { status: "authenticated"; user: UserInfo }
	| { status: "unauthenticated" }
	| { status: "unknown" };

export async function fetchCurrentUser({
	request,
	context,
}: FetchCurrentUserArgs): Promise<FetchCurrentUserResult> {
	try {
		const response = await fetcher(
			context,
			endpoints.users.me,
			{
				headers: {
					Cookie: request.headers.get("cookie") ?? "",
				},
			},
			{ fallbackPath: "/api/users/me" },
		);

		if (response.status === 204) {
			return { status: "unauthenticated" };
		}

		if (!response.ok) {
			return { status: "unauthenticated" };
		}

		const data = (await response.json()) as UserInfo | null;
		if (!data) {
			return { status: "unauthenticated" };
		}

		return { status: "authenticated", user: data };
	} catch (error) {
		return { status: "unknown" };
	}
}
