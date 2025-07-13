import { lazy, Suspense, useState, useEffect, useMemo, useCallback } from "react";
import { useLoaderData, useNavigate, useNavigation, useOutletContext } from "react-router";
import { WeekCalendar } from "~/components/common/WeekCalendar";
import {
	format,
	parseISO,
	startOfWeek,
	endOfWeek,
	addDays,
	subDays,
	startOfMonth,
	endOfMonth,
} from "date-fns";
import type { Note, NotesByDateResponse } from "~/features/notes/types/note";
import type { Route } from "./+types";
import { fetchDays, fetchNotes } from "~/features/notes/api/get";
import { AccessLevel, accessLevelLabels } from "~/constants/accessLevel";
import { formatInTimeZone } from "date-fns-tz";
import { Skeleton } from "~/components/ui/skeleton";
import type { UserInfo } from "~/types/user";
import { noteContentTypeLabels } from "~/constants/noteContentType";
import { motion, type PanInfo } from "framer-motion";
import { usePreventBackNavigation } from "~/hooks/usePreventBackNavigation";
import { TagLink } from "~/components/common/TagLink";
import { useTags } from "~/features/tags/hooks/useTags";
import { useNoteDays } from "~/features/notes/hooks/useNoteDays";
import ClientOnly from "~/components/common/ClientOnly";
import { ViewMode } from "~/constants/viewMode";

export async function loader({ request, context }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const dateParam = url.searchParams.get("date");
	const date = dateParam
		? formatInTimeZone(new Date(dateParam), "Asia/Tokyo", "yyyy-MM-dd")
		: formatInTimeZone(new Date(), "Asia/Tokyo", "yyyy-MM-dd");
	const notes = await fetchNotes(request, context, { date: parseISO(date) });

	const selectedDate = parseISO(date);
	const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
	const endDate = endOfWeek(selectedDate, { weekStartsOn: 1 });

	let noteDays: string[] = [];
	try {
		noteDays = await fetchDays(request, context, { startDate, endDate });
	} catch (error) {
		console.error("Failed to fetch note days:", error);
		noteDays = [];
	}

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

const getPreviousDay = (currentDate: Date): Date => {
	return subDays(currentDate, 1);
};

const getNextDay = (currentDate: Date): Date => {
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
	const [currentWeek, setCurrentWeek] = useState<Date>(new Date(date));
	const [isSwipeActive, setIsSwipeActive] = useState(false);
	const [swipeDirection, setSwipeDirection] = useState<"horizontal" | "vertical" | null>(null);
	const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);
	const { tags } = useTags();
	const { noteDays: hookNoteDays, fetchNoteDays } = useNoteDays();
	const [currentNoteDays, setCurrentNoteDays] = useState<string[]>(noteDays);

	const handleDateSelect = useCallback(
		(selected: Date) => {
			setSelectedDate(selected);
			const dateStr = format(selected, "yyyy-MM-dd");
			navigate(`?date=${dateStr}`);
		},
		[navigate],
	);

	const handleNoteDaysChange = useCallback(
		(startDate: Date, endDate: Date) => {
			fetchNoteDays(startDate, endDate);
		},
		[fetchNoteDays],
	);

	const handleWeekChange = useCallback(
		(date: Date) => {
			setSelectedDate(date);
			setCurrentWeek(date);
			navigate(`?date=${format(date, "yyyy-MM-dd")}`);

			// 週変更時にnoteDaysを更新
			const weekStart = startOfWeek(date, { weekStartsOn: 1 });
			const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
			handleNoteDaysChange(weekStart, weekEnd);
		},
		[navigate, handleNoteDaysChange],
	);

	const handleEditNote = useCallback(
		(note: Note) => {
			if (!userInfo) return;
			onClickEditNote(note);
		},
		[userInfo, onClickEditNote],
	);

	const handleSwipe = useCallback(
		(direction: "left" | "right") => {
			const newDate =
				direction === "left" ? getNextDay(selectedDate) : getPreviousDay(selectedDate);

			const today = new Date();
			const maxFutureDate = addDays(today, 365);
			const minPastDate = subDays(today, 730);

			if (newDate > maxFutureDate || newDate < minPastDate) {
				return;
			}

			setSelectedDate(newDate);
			setCurrentWeek(newDate);
			navigateToDate(newDate, navigate);

			// swipe時にnoteDaysを更新（viewModeに応じて期間を変更）
			if (viewMode === ViewMode.Month) {
				const monthStart = startOfMonth(newDate);
				const monthEnd = endOfMonth(newDate);
				handleNoteDaysChange(monthStart, monthEnd);
			} else {
				const weekStart = startOfWeek(newDate, { weekStartsOn: 1 });
				const weekEnd = endOfWeek(newDate, { weekStartsOn: 1 });
				handleNoteDaysChange(weekStart, weekEnd);
			}
		},
		[selectedDate, navigate, handleNoteDaysChange, viewMode],
	);

	useEffect(() => {
		if (hookNoteDays.length > 0) {
			setCurrentNoteDays(hookNoteDays);
		}
	}, [hookNoteDays]);

	return (
		<Suspense fallback={<Skeleton className="h-screen w-full" />}>
			<div className="max-w-2xl mx-auto space-y-6">
				<div className="w-full">
					<WeekCalendar
						selectedDate={selectedDate}
						onDateSelect={handleDateSelect}
						onWeekChange={handleWeekChange}
						noteDays={currentNoteDays}
						onNoteDaysChange={handleNoteDaysChange}
						onViewModeChange={setViewMode}
						viewMode={viewMode}
						className="p-0"
					/>
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
					onPan={useCallback(
						(event: PointerEvent, info: PanInfo) => {
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
						},
						[swipeDirection],
					)}
					onPanEnd={useCallback(
						(_event: PointerEvent, info: PanInfo) => {
							const horizontalDistance = Math.abs(info.offset.x);
							const swipeThreshold = window.innerWidth / 3;

							// 水平スワイプかつ閾値を超えた場合のみ日付変更
							if (swipeDirection === "horizontal" && horizontalDistance > swipeThreshold) {
								const direction = info.offset.x > 0 ? "right" : "left";
								handleSwipe(direction);
							}

							// 状態をリセット
							setIsSwipeActive(false);
							setSwipeDirection(null);
						},
						[swipeDirection, handleSwipe],
					)}
					drag={false}
					style={{
						filter: isSwipeActive ? "brightness(0.95)" : "brightness(1)",
						transition: "filter 0.2s ease",
						touchAction: "pan-y pinch-zoom",
					}}
				>
					{useMemo(
						() =>
							isLoading ? null : (
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
															<ClientOnly fallback={<Skeleton className="h-20 w-full" />}>
																<NoteContent note={note} />
															</ClientOnly>
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
							),
						[isLoading, notes, handleEditNote],
					)}
				</motion.section>
				{tags && tags.length > 0 && (
					<div className="mt-4">
						<div className="flex justify-start flex-wrap gap-x-2 gap-y-1">
							{tags.map((tag) => (
								<TagLink key={tag.id} id={tag.id} name={tag.name} />
							))}
						</div>
					</div>
				)}
			</div>
		</Suspense>
	);
}
