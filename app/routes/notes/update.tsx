import { useParams, type ActionFunctionArgs } from "react-router";
import type { AccessLevel } from "~/constants/accessLevel";
import { endpoints } from "~/constants/endpoints";
import { fetcher } from "~/lib/fetcher";

type Body = {
	content: string;
	accessLevel: AccessLevel;
	tagIds?: string[];
	images?: string[];
};

export async function action({ request, context }: ActionFunctionArgs): Promise<Response> {
	try {
		const { id } = useParams();
		if (!id) return new Response("Invalid request", { status: 400 });

		const body: Body = await request.json();
		if (!body.content || !body.accessLevel)
			throw new Response("Invalid request body", { status: 400 });

		const res = await fetcher(context, endpoints.notes.update(id), {
			headers: {
				Cookie: request.headers.get("cookie") || "",
			},
			method: "POST",
			body: JSON.stringify(body),
		});
		return res;
	} catch (error) {
		console.error("Failed to update note:", error);
		return new Response("Failed to update note", { status: 500 });
	}
}
