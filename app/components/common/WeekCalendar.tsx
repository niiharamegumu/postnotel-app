import {
	format,
	startOfWeek,
	endOfWeek,
	eachDayOfInterval,
	addWeeks,
	subWeeks,
	addMonths,
	subMonths,
	startOfMonth,
	endOfMonth,
} from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import {
	CalendarArrowDown,
	CalendarArrowUp,
	CalendarCheck,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { Calendar } from "~/components/ui/calendar";
import { useState, useMemo, useCallback, useEffect } from "react";
import { ViewMode } from "~/constants/viewMode";

interface WeekCalendarProps {
	selectedDate: Date;
	noteDays: string[];
	onDateSelect: (date: Date) => void;
	onWeekChange: (date: Date) => void;
	onDateRangeChange?: (startDate: Date, endDate: Date) => void;
	onCalendarReady?: (
		getDateRange: (newDate: Date) => { startDate: Date; endDate: Date; viewMode: ViewMode },
	) => void;
	className?: string;
}

export function WeekCalendar({
	selectedDate,
	noteDays,
	onDateSelect,
	onWeekChange,
	onDateRangeChange,
	onCalendarReady,
	className,
}: WeekCalendarProps) {
	const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);

	// スワイプ時に使用する期間計算関数を外部に提供
	const getDateRangeForSwipe = useCallback(
		(newDate: Date) => {
			if (viewMode === ViewMode.Month) {
				return {
					startDate: startOfMonth(newDate),
					endDate: endOfMonth(newDate),
					viewMode: ViewMode.Month,
				};
			}
			return {
				startDate: startOfWeek(newDate, { weekStartsOn: 1 }),
				endDate: endOfWeek(newDate, { weekStartsOn: 1 }),
				viewMode: ViewMode.Week,
			};
		},
		[viewMode],
	);

	// カレンダーが準備できたときに期間計算関数を外部に提供
	useEffect(() => {
		if (onCalendarReady) {
			onCalendarReady(getDateRangeForSwipe);
		}
	}, [onCalendarReady, getDateRangeForSwipe]);
	const weekDays = useMemo(() => {
		const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
		const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
		return eachDayOfInterval({ start, end });
	}, [selectedDate]);

	const handlePreviousWeek = useCallback(() => {
		const previousWeek = subWeeks(selectedDate, 1);
		onWeekChange(previousWeek);
		// 週変更時にnoteDaysを更新
		if (onDateRangeChange) {
			const weekStart = startOfWeek(previousWeek, { weekStartsOn: 1 });
			const weekEnd = endOfWeek(previousWeek, { weekStartsOn: 1 });
			onDateRangeChange(weekStart, weekEnd);
		}
	}, [selectedDate, onWeekChange, onDateRangeChange]);

	const handleNextWeek = useCallback(() => {
		const nextWeek = addWeeks(selectedDate, 1);
		onWeekChange(nextWeek);
		// 週変更時にnoteDaysを更新
		if (onDateRangeChange) {
			const weekStart = startOfWeek(nextWeek, { weekStartsOn: 1 });
			const weekEnd = endOfWeek(nextWeek, { weekStartsOn: 1 });
			onDateRangeChange(weekStart, weekEnd);
		}
	}, [selectedDate, onWeekChange, onDateRangeChange]);

	const handlePreviousMonth = useCallback(() => {
		const previousMonth = subMonths(selectedDate, 1);
		onWeekChange(previousMonth);
		// 月変更時にnoteDaysを更新
		if (onDateRangeChange) {
			const monthStart = startOfMonth(previousMonth);
			const monthEnd = endOfMonth(previousMonth);
			onDateRangeChange(monthStart, monthEnd);
		}
	}, [selectedDate, onWeekChange, onDateRangeChange]);

	const handleNextMonth = useCallback(() => {
		const nextMonth = addMonths(selectedDate, 1);
		onWeekChange(nextMonth);
		// 月変更時にnoteDaysを更新
		if (onDateRangeChange) {
			const monthStart = startOfMonth(nextMonth);
			const monthEnd = endOfMonth(nextMonth);
			onDateRangeChange(monthStart, monthEnd);
		}
	}, [selectedDate, onWeekChange, onDateRangeChange]);

	const handleTodayClick = useCallback(() => {
		const today = new Date();
		onWeekChange(today);
		if (onDateRangeChange) {
			if (viewMode === ViewMode.Month) {
				const monthStart = startOfMonth(today);
				const monthEnd = endOfMonth(today);
				onDateRangeChange(monthStart, monthEnd);
			} else {
				const weekStart = startOfWeek(today, { weekStartsOn: 1 });
				const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
				onDateRangeChange(weekStart, weekEnd);
			}
		}
	}, [onWeekChange, onDateRangeChange, viewMode]);

	const handleViewModeToggle = useCallback(() => {
		const newViewMode = viewMode === ViewMode.Week ? ViewMode.Month : ViewMode.Week;
		setViewMode(newViewMode);

		if (onDateRangeChange) {
			if (newViewMode === ViewMode.Month) {
				const monthStart = startOfMonth(selectedDate);
				const monthEnd = endOfMonth(selectedDate);
				onDateRangeChange(monthStart, monthEnd);
			} else {
				const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
				const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
				onDateRangeChange(weekStart, weekEnd);
			}
		}
	}, [viewMode, selectedDate, onDateRangeChange]);

	const isToday = useCallback((date: Date): boolean => {
		const today = new Date();
		return format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
	}, []);

	const isSelected = useCallback(
		(date: Date): boolean => {
			return format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
		},
		[selectedDate],
	);

	const hasNote = useCallback(
		(date: Date): boolean => {
			return noteDays.some((d) => d === format(date, "yyyy-MM-dd"));
		},
		[noteDays],
	);

	return (
		<div className={cn("p-0", className)}>
			{/* 週ヘッダー */}
			<div className="flex h-7 items-center mb-4 gap-2">
				<span className="text-sm font-bold">
					{format(selectedDate, "yyyy年M月d日（E）", { locale: ja })}
				</span>
				<div className="ml-auto flex items-center gap-4">
					<span onClick={handleTodayClick}>
						<CalendarCheck size={20} />
					</span>
					<span onClick={handleViewModeToggle} className="cursor-pointer">
						{viewMode === ViewMode.Week ? (
							<CalendarArrowDown size={20} />
						) : (
							<CalendarArrowUp size={20} />
						)}
					</span>
					<div className="flex gap-1">
						<button
							type="button"
							onClick={viewMode === ViewMode.Week ? handlePreviousWeek : handlePreviousMonth}
							className={cn(
								buttonVariants({ variant: "outline" }),
								"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
							)}
						>
							<ChevronLeft className="h-4 w-4" />
						</button>
						<button
							type="button"
							onClick={viewMode === ViewMode.Week ? handleNextWeek : handleNextMonth}
							className={cn(
								buttonVariants({ variant: "outline" }),
								"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
							)}
						>
							<ChevronRight className="h-4 w-4" />
						</button>
					</div>
				</div>
			</div>

			{/* 週表示 */}
			{viewMode === ViewMode.Week && (
				<div className="w-full">
					{/* 曜日ヘッダー */}
					<div className="flex w-full justify-between mb-2">
						{weekDays.map((day) => (
							<div
								key={day.toString()}
								className="flex-1 text-center text-sm font-normal text-muted-foreground"
							>
								{format(day, "E", { locale: ja })}
							</div>
						))}
					</div>

					{/* 日付グリッド */}
					<div className="flex w-full justify-between">
						{weekDays.map((day) => (
							<div key={day.toString()} className="flex-1 flex items-center justify-center">
								<button
									type="button"
									onClick={() => onDateSelect(day)}
									className={cn(
										"size-8 rounded-md p-0 font-normal transition-none flex items-center justify-center text-sm",
										{
											// 選択された日付
											"bg-red-400 text-primary": isSelected(day),
											// 今日の日付（選択されていない場合）
											"border-2 border-primary bg-transparent": isToday(day) && !isSelected(day),
											// ノートが存在する日付
											"bg-green-300 text-green-600 rounded-full": hasNote(day) && !isSelected(day),
											// デフォルト
											"hover:bg-accent hover:text-accent-foreground": !isSelected(day),
										},
									)}
								>
									{format(day, "d")}
								</button>
							</div>
						))}
					</div>
				</div>
			)}

			{/* 月表示 */}
			{viewMode === ViewMode.Month && (
				<div className="w-full">
					<Calendar
						mode="single"
						selected={selectedDate}
						onSelect={(date) => date && onDateSelect(date)}
						month={selectedDate}
						onMonthChange={(date) => onWeekChange(date)}
						locale={ja}
						weekStartsOn={1}
						className="w-full p-0"
						classNames={{
							month: "w-full",
							month_caption: "hidden",
							caption_label: "hidden",
							button_next: "hidden",
							button_previous: "hidden",
							month_grid: "w-full mt-0",
							week: "flex w-full justify-between mb-2",
							weekdays: "flex w-full justify-between mb-2",
							weekday: "flex-1 text-center text-sm font-normal text-muted-foreground",
							day: "flex-1 flex items-center justify-center",
							day_button: cn(
								"size-8 rounded-md p-0 font-normal transition-none flex items-center justify-center text-sm",
								"hover:bg-accent hover:text-accent-foreground",
							),
							today: "[&>button]:border-2 [&>button]:border-primary [&>button]:bg-transparent",
							selected: "[&>button]:!bg-red-400 [&>button]:!text-primary [&>button]:!border-0",
						}}
						modifiers={{
							hasNote: (date) => hasNote(date),
							todayWithNote: (date) => isToday(date) && hasNote(date),
						}}
						modifiersClassNames={{
							hasNote: "[&>button]:bg-green-300 [&>button]:text-green-600 [&>button]:rounded-full",
							todayWithNote: "[&>button]:!bg-green-300 [&>button]:!text-green-600 [&>button]:!border-2 [&>button]:!border-primary [&>button]:!rounded-full",
						}}
					/>
				</div>
			)}
		</div>
	);
}
