import type { ActionFunctionArgs } from "react-router";
import { endpoints } from "~/constants/endpoints";
import { fetcher } from "~/lib/fetcher";

export async function action({ request, context, params }: ActionFunctionArgs): Promise<Response> {
	try {
		const id = params.id;
		if (!id) return new Response("Invalid request", { status: 400 });

		const res = await fetcher(context, endpoints.notes.delete(id), {
			headers: {
				Cookie: request.headers.get("cookie") || "",
			},
			method: "DELETE",
		});

		return res;
	} catch (error) {
		console.error("Failed to delete note:", error);
		return new Response("Failed to delete note", { status: 500 });
	}
}
