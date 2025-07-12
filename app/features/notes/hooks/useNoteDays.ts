import { useCallback, useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { format } from "date-fns";

export function useNoteDays() {
	const [noteDays, setNoteDays] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const fetcher = useFetcher<{ noteDays: string[] }>();

	const fetchNoteDays = useCallback((startDate: Date, endDate: Date) => {
		setLoading(true);
		setError(null);

		const searchParams = new URLSearchParams();
		searchParams.set("startDate", format(startDate, "yyyy-MM-dd"));
		searchParams.set("endDate", format(endDate, "yyyy-MM-dd"));

		fetcher.load(`/api/note-days?${searchParams.toString()}`);
	}, [fetcher]);

	useEffect(() => {
		if (fetcher.data && fetcher.state === "idle") {
			setNoteDays(fetcher.data.noteDays);
			setLoading(false);
			setError(null);
		} else if (fetcher.state === "loading") {
			setLoading(true);
		}
	}, [fetcher.data, fetcher.state]);

	return {
		noteDays,
		loading,
		error,
		fetchNoteDays,
	};
}