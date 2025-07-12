import type { ActionFunctionArgs } from "react-router";
import type { AccessLevel } from "~/constants/accessLevel";
import { endpoints } from "~/constants/endpoints";
import { fetcher } from "~/lib/fetcher";

type Body = {
	content: string;
	accessLevel: AccessLevel;
	noteDay: string;
	tagIds?: string[];
	images?: string[];
};

export async function action({ request, context }: ActionFunctionArgs): Promise<Response> {
	try {
		const body: Body = await request.json();
		if (!body.content || !body.accessLevel || !body.noteDay) {
			throw new Response("Invalid request body", { status: 400 });
		}
		const res = await fetcher(context, endpoints.notes.create, {
			headers: {
				Cookie: request.headers.get("cookie") || "",
			},
			method: "POST",
			body: JSON.stringify(body),
		});
		return res;
	} catch (error) {
		console.error("Failed to create note:", error);
		return new Response("Failed to create note", { status: 500 });
	}
}
