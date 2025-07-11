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
import { useState } from "react";

type ViewMode = "week" | "month";

interface WeekCalendarProps {
	selectedDate: Date;
	onDateSelect: (date: Date) => void;
	onWeekChange: (date: Date) => void;
	noteDays: string[];
	onNoteDaysChange?: (startDate: Date, endDate: Date) => void;
	className?: string;
}

export function WeekCalendar({
	selectedDate,
	onDateSelect,
	onWeekChange,
	noteDays,
	onNoteDaysChange,
	className,
}: WeekCalendarProps) {
	const [viewMode, setViewMode] = useState<ViewMode>("week");
	const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
	const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
	const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

	const handlePreviousWeek = () => {
		const previousWeek = subWeeks(selectedDate, 1);
		onWeekChange(previousWeek);
	};

	const handleNextWeek = () => {
		const nextWeek = addWeeks(selectedDate, 1);
		onWeekChange(nextWeek);
	};

	const handlePreviousMonth = () => {
		const previousMonth = subMonths(selectedDate, 1);
		onWeekChange(previousMonth);
	};

	const handleNextMonth = () => {
		const nextMonth = addMonths(selectedDate, 1);
		onWeekChange(nextMonth);
	};

	const handleTodayClick = () => {
		const today = new Date();
		onWeekChange(today);
	};

	const handleViewModeToggle = () => {
		const newViewMode = viewMode === "week" ? "month" : "week";
		setViewMode(newViewMode);

		if (onNoteDaysChange) {
			if (newViewMode === "month") {
				const monthStart = startOfMonth(selectedDate);
				const monthEnd = endOfMonth(selectedDate);
				onNoteDaysChange(monthStart, monthEnd);
			} else {
				const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
				const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
				onNoteDaysChange(weekStart, weekEnd);
			}
		}
	};

	const isToday = (date: Date): boolean => {
		const today = new Date();
		return format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
	};

	const isSelected = (date: Date): boolean => {
		return format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
	};

	const hasNote = (date: Date): boolean => {
		return noteDays.some((d) => d === format(date, "yyyy-MM-dd"));
	};

	return (
		<div className={cn("p-0", className)}>
			{/* 週ヘッダー */}
			<div className="flex h-7 items-center justify-between mb-4 gap-2">
				<span className="text-sm font-bold">
					{format(selectedDate, "yyyy年M月d日（E）", { locale: ja })}
				</span>
				<div className="flex items-center gap-3">
					<span onClick={handleTodayClick}>
						<CalendarCheck size={20} />
					</span>
					<span onClick={handleViewModeToggle} className="cursor-pointer">
						{viewMode === "week" ? <CalendarArrowDown size={20} /> : <CalendarArrowUp size={20} />}
					</span>
				</div>
				<div className="flex gap-1">
					<button
						type="button"
						onClick={viewMode === "week" ? handlePreviousWeek : handlePreviousMonth}
						className={cn(
							buttonVariants({ variant: "outline" }),
							"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
						)}
					>
						<ChevronLeft className="h-4 w-4" />
					</button>
					<button
						type="button"
						onClick={viewMode === "week" ? handleNextWeek : handleNextMonth}
						className={cn(
							buttonVariants({ variant: "outline" }),
							"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
						)}
					>
						<ChevronRight className="h-4 w-4" />
					</button>
				</div>
			</div>

			{/* 週表示 */}
			{viewMode === "week" && (
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
			{viewMode === "month" && (
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
						}}
						modifiersClassNames={{
							hasNote: "[&>button]:bg-green-300 [&>button]:text-green-600 [&>button]:rounded-full",
						}}
					/>
				</div>
			)}
		</div>
	);
}
