import { lazy, Suspense, useState } from "react";
import { useLoaderData, useNavigate, useNavigation, useOutletContext } from "react-router";
import { Calendar } from "~/components/ui/calendar";
import { ja } from "date-fns/locale";
import { format, parseISO, addDays, subDays, startOfMonth, endOfMonth } from "date-fns";
import type { Note, NotesByDateResponse } from "~/features/notes/types/note";
import type { Route } from "./+types";
import { fetchDays, fetchNotes } from "~/features/notes/api/get";
import { AccessLevel, accessLevelLabels } from "~/constants/accessLevel";
import { formatInTimeZone } from "date-fns-tz";
import { Skeleton } from "~/components/ui/skeleton";
import type { UserInfo } from "~/types/user";
import { noteContentTypeLabels } from "~/constants/noteContentType";
import { motion } from "framer-motion";
import { usePreventBackNavigation } from "~/hooks/usePreventBackNavigation";
import { TagLink } from "~/components/common/TagLink";
import { useTags } from "~/features/tags/hooks/useTags";

export async function loader({ request, context }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const dateParam = url.searchParams.get("date");
	const date = dateParam
		? formatInTimeZone(new Date(dateParam), "Asia/Tokyo", "yyyy-MM-dd")
		: formatInTimeZone(new Date(), "Asia/Tokyo", "yyyy-MM-dd");
	const notes = await fetchNotes(request, context, { date: parseISO(date) });

	const selectedDate = parseISO(date);
	const startDate = startOfMonth(selectedDate);
	const endDate = endOfMonth(selectedDate);

	const noteDays = await fetchDays(request, context, { startDate, endDate });
	return { notes, date, noteDays };
}

export function meta() {
	return [{ title: "PostNotel Notes" }, { name: "description", content: "PostNotel Notes" }];
}

const NoteContent = lazy(() => import("~/features/notes/components/.client/content"));

const navigateToDate = (date: Date, navigate: (path: string) => void) => {
	const dateStr = format(date, "yyyy-MM-dd");
	navigate(`?date=${dateStr}`);
};

const getPreviousDate = (currentDate: Date): Date => {
	return subDays(currentDate, 1);
};

const getNextDate = (currentDate: Date): Date => {
	return addDays(currentDate, 1);
};

export default function Index() {
	const { userInfo, onClickEditNote } = useOutletContext<{
		userInfo: UserInfo | null;
		onClickEditNote: (note: Note) => void;
	}>();
	usePreventBackNavigation();
	const navigate = useNavigate();
	const navigation = useNavigation();
	const isLoading = navigation.state === "loading";

	const { notes, date, noteDays } = useLoaderData<typeof loader>() as {
		notes: NotesByDateResponse | null;
		date: string;
		noteDays: string[];
	};

	const [selectedDate, setSelectedDate] = useState<Date>(new Date(date));
	const [currentMonth, setCurrentMonth] = useState<Date>(new Date(date));
	const [isSwipeActive, setIsSwipeActive] = useState(false);
	const [swipeDirection, setSwipeDirection] = useState<"horizontal" | "vertical" | null>(null);
	const { tags } = useTags();

	const handleSelect = (selected: Date | undefined) => {
		if (selected) {
			setSelectedDate(selected);
			const dateStr = format(selected, "yyyy-MM-dd");
			navigate(`?date=${dateStr}`);
		}
	};

	const handleTodayClick = () => {
		const today = new Date();
		setSelectedDate(today);
		setCurrentMonth(today);
		navigate(`?date=${format(today, "yyyy-MM-dd")}`);
	};

	const handleMonthChange = (month: Date) => {
		setCurrentMonth(month);
		const firstDayOfMonth = startOfMonth(month);
		setSelectedDate(firstDayOfMonth);
		navigate(`?date=${format(firstDayOfMonth, "yyyy-MM-dd")}`);
	};

	const handleEditNote = (note: Note) => {
		if (!userInfo) return;
		onClickEditNote(note);
	};

	const handleSwipe = (direction: "left" | "right") => {
		const newDate =
			direction === "left" ? getNextDate(selectedDate) : getPreviousDate(selectedDate);

		const today = new Date();
		const maxFutureDate = addDays(today, 365);
		const minPastDate = subDays(today, 365 * 2);

		if (newDate > maxFutureDate || newDate < minPastDate) {
			return;
		}

		setSelectedDate(newDate);
		setCurrentMonth(newDate);
		navigateToDate(newDate, navigate);
	};

	return (
		<Suspense fallback={<Skeleton className="h-screen w-full" />}>
			<div className="flex flex-col md:flex-row md:gap-8">
				<div className="w-auto">
					<Calendar
						mode="single"
						selected={selectedDate}
						onSelect={handleSelect}
						month={currentMonth}
						onMonthChange={handleMonthChange}
						locale={ja}
						formatters={{
							formatCaption: (month: Date) => format(month, "yyyy年M月", { locale: ja }),
						}}
						components={{
							CaptionLabel: (props) => (
								<span
									{...props}
									onClick={handleTodayClick}
									className="cursor-pointer hover:text-primary"
								>
									{props.children}
								</span>
							),
						}}
						modifiers={{
							hasNote: (date) => noteDays.some((d) => d === format(date, "yyyy-MM-dd")),
							todayNotSelected: (date) => {
								const today = new Date();
								const isToday = format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
								const isSelected =
									format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
								return isToday && !isSelected;
							},
						}}
						modifiersClassNames={{
							hasNote: "[&>button]:bg-green-300 [&>button]:text-green-600 [&>button]:rounded-full",
							todayNotSelected:
								"[&>button]:border-2 [&>button]:border-primary [&>button]:bg-transparent",
						}}
						className="p-0"
						classNames={{
							month_grid: "w-full",
							weekdays: "flex w-full justify-between",
							weekday: "flex-1 text-center",
							week: "flex w-full justify-between",
							day: "flex-1 flex items-center justify-center",
							selected: "[&>button]:bg-red-400 [&>button]:text-primary",
						}}
					/>
					{/* PC用タグ一覧表示 */}
					{tags && tags.length > 0 && (
						<div className="hidden md:block mt-4 max-w-100">
							<div className="flex justify-start flex-wrap gap-x-2 gap-y-1">
								{tags.map((tag) => (
									<TagLink key={tag.id} id={tag.id} name={tag.name} />
								))}
							</div>
						</div>
					)}
				</div>
				<motion.section
					className="w-full min-h-screen md:min-h-[80vh]"
					initial={{ x: 0, opacity: 1 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{
						type: "spring",
						stiffness: 300,
						damping: 30,
					}}
					onPanStart={() => {
						setSwipeDirection(null);
						setIsSwipeActive(false);
					}}
					onPan={(event, info) => {
						const horizontalDistance = Math.abs(info.offset.x);
						const verticalDistance = Math.abs(info.offset.y);

						// スワイプ方向を決定（一度決まったら変更しない）
						if (swipeDirection === null && (horizontalDistance > 20 || verticalDistance > 20)) {
							if (horizontalDistance > verticalDistance * 1.2) {
								setSwipeDirection("horizontal");
								setIsSwipeActive(true);
							} else {
								setSwipeDirection("vertical");
								setIsSwipeActive(false);
							}
						}

						// 水平スワイプの場合のみpreventDefault
						if (swipeDirection === "horizontal" && horizontalDistance > 30) {
							event.preventDefault();
						}
					}}
					onPanEnd={(_, info) => {
						const horizontalDistance = Math.abs(info.offset.x);
						const swipeThreshold = 80;

						// 水平スワイプかつ閾値を超えた場合のみ日付変更
						if (swipeDirection === "horizontal" && horizontalDistance > swipeThreshold) {
							const direction = info.offset.x > 0 ? "right" : "left";
							handleSwipe(direction);
						}

						// 状態をリセット
						setIsSwipeActive(false);
						setSwipeDirection(null);
					}}
					drag={false}
					style={{
						filter: isSwipeActive ? "brightness(0.95)" : "brightness(1)",
						transition: "filter 0.2s ease",
						touchAction: "pan-y pinch-zoom",
					}}
				>
					<h2 className="mt-4 mb-2 text-center text-sm font-bold text-primary md:text-left md:mb-4 md:mt-0">
						{format(selectedDate, "yyyy年M月d日（E）", { locale: ja })}
					</h2>
					{isLoading ? null : (
						<>
							{notes && notes.notes.length > 0 ? (
								<ul className="space-y-4">
									{notes.notes.map((note) => (
										<Suspense
											key={note.noteId}
											fallback={
												<li>
													<Skeleton className="h-10 w-full" />
												</li>
											}
										>
											<li className="flex flex-col items-start">
												{note.images?.length > 0 && (
													<div className="mb-2">
														<div className="flex gap-2 flex-nowrap overflow-x-auto">
															{note.images.map((img, i) => (
																<div
																	key={`${note.noteId}-img-${i}`}
																	className={`rounded-xl p-2 cursor-pointer shrink-0 ${
																		note.accessLevel === AccessLevel.Private
																			? "bg-secondary"
																			: "bg-primary"
																	}`}
																	onClick={() => handleEditNote(note)}
																>
																	<img
																		src={img}
																		alt={`ノート添付 #${i + 1}`}
																		className="w-auto h-auto max-h-[200px] object-cover rounded-xl"
																	/>
																</div>
															))}
														</div>
													</div>
												)}
												<div
													className={`${note.accessLevel === AccessLevel.Private ? "cursor-pointer" : ""} wrap-anywhere overflow-y-auto rounded-xl mb-1`}
													onClick={() => handleEditNote(note)}
												>
													<NoteContent note={note} />
												</div>
												<div className="text-xs text-muted-foreground ml-2 flex items-start gap-2">
													<div>{format(new Date(note.createdAt), "HH:mm")}</div>
													{note.accessLevel === AccessLevel.Private && (
														<div>{accessLevelLabels[note.accessLevel]}</div>
													)}
													<div>{noteContentTypeLabels[note.contentType]}</div>
													{note.tags && note.tags.tags.length > 0 && (
														<div className="flex items-center gap-2">
															{note.tags.tags.map((tag) => (
																<TagLink key={tag.id} id={tag.id} name={tag.name} />
															))}
														</div>
													)}
												</div>
											</li>
										</Suspense>
									))}
								</ul>
							) : (
								<div className="flex items-center justify-center min-h-[60vh]">
									<p className="text-primary text-center">ノートがありません。</p>
								</div>
							)}
						</>
					)}
				</motion.section>
			</div>
			{/* SP用タグ一覧表示 */}
			{tags && tags.length > 0 && (
				<div className="block md:hidden mt-4">
					<div className="flex justify-start flex-wrap gap-x-2 gap-y-1">
						{tags.map((tag) => (
							<TagLink key={tag.id} id={tag.id} name={tag.name} />
						))}
					</div>
				</div>
			)}
		</Suspense>
	);
}
