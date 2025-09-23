import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { format, isValid, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { useSearchParamsUpdate } from "../hooks/useSearchParamsUpdate";
import { X } from "lucide-react";

const URL_FORMAT = "yyyy-MM-dd";

const toDateOrNull = (value: string | null): Date | null => {
	if (!value) return null;
	const parsed = parseISO(value);
	return isValid(parsed) ? parsed : null;
};

const toDisplayText = (value: string | null): string => {
	const date = toDateOrNull(value);
	return date ? format(date, URL_FORMAT) : "";
};

export function DateRangeSelectionForm() {
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);
	const [searchParams] = useSearchParams();
	const updateSearchParams = useSearchParamsUpdate();

	const startDateParam = searchParams.get("startDate");
	const endDateParam = searchParams.get("endDate");

	const selectedRange = useMemo<DateRange | undefined>(() => {
		const from = toDateOrNull(startDateParam);
		const to = toDateOrNull(endDateParam);
		if (!from && !to) {
			return undefined;
		}
		return { from: from ?? undefined, to: to ?? undefined };
	}, [startDateParam, endDateParam]);

	const handleRangeSelect = useCallback(
		(range: DateRange | undefined) => {
			if (!range || (!range.from && !range.to)) {
				updateSearchParams({ startDate: null, endDate: null });
				return;
			}

			const start = range.from ? format(range.from, URL_FORMAT) : null;
			const end = range.to ? format(range.to, URL_FORMAT) : null;

			updateSearchParams({ startDate: start, endDate: end });
		},
		[updateSearchParams],
	);

	const handleToggleCalendar = useCallback(() => {
		setIsCalendarOpen((prev) => !prev);
	}, []);

	const rangeLabel = useMemo(() => {
		const start = toDisplayText(startDateParam);
		const end = toDisplayText(endDateParam);
		if (!start && !end) {
			return "日付選択";
		}
		if (start && !end) {
			return `${start} 〜`;
		}
		if (!start && end) {
			return `〜 ${end}`;
		}
		return `${start} 〜 ${end}`;
	}, [startDateParam, endDateParam]);

	return (
		<div className="space-y-2">
			<Button
				variant="outline"
				size="sm"
				onClick={handleToggleCalendar}
				className="shadow-none rounded w-full justify-center"
			>
				{isCalendarOpen ? "Close" : rangeLabel}
			</Button>
			{isCalendarOpen ? (
				<div className="rounded border bg-background p-2">
					<Calendar
						mode="range"
						numberOfMonths={1}
						selected={selectedRange}
						onSelect={handleRangeSelect}
						defaultMonth={selectedRange?.from ?? selectedRange?.to ?? undefined}
						locale={ja}
					/>
				</div>
			) : null}
		</div>
	);
}
