import { parseISO } from "date-fns";
import { fetchDays } from "~/features/notes/api/get";
import type { Route } from "./+types/index";

export async function loader({ request, context }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const startDateParam = url.searchParams.get("startDate");
	const endDateParam = url.searchParams.get("endDate");

	if (!startDateParam || !endDateParam) {
		throw new Response("Missing startDate or endDate parameter", { status: 400 });
	}

	const startDate = parseISO(startDateParam);
	const endDate = parseISO(endDateParam);

	const noteDays = await fetchDays(request, context, { startDate, endDate });

	return Response.json({ noteDays });
}
