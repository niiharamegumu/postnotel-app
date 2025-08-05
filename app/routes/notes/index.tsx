import { addDays, endOfWeek, format, parseISO, startOfWeek, subDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { type PanInfo, motion } from "framer-motion";
import { Suspense, lazy, useCallback, useMemo, useState } from "react";
import { useLoaderData, useNavigate, useOutletContext } from "react-router";
import ClientOnly from "~/components/common/ClientOnly";
import { ImageZoomModal } from "~/components/common/ImageZoomModal";
import { LoadingState } from "~/components/common/LoadingState";
import { TagLink } from "~/components/common/TagLink";
import { WeekCalendar } from "~/components/common/WeekCalendar";
import { AccessLevel, accessLevelLabels } from "~/constants/accessLevel";
import { NoteContentType, noteContentTypeLabels } from "~/constants/noteContentType";
import type { ViewMode } from "~/constants/viewMode";
import { fetchDays, fetchNotesWithPagination } from "~/features/notes/api/get";
import { useNoteDays } from "~/features/notes/hooks/useNoteDays";
import type { Note } from "~/features/notes/types/note";
import { useTags } from "~/features/tags/hooks/useTags";
import { useImageZoom } from "~/hooks/useImageZoom";
import { useNavigation } from "~/hooks/useNavigation";
import { usePreventBackNavigation } from "~/hooks/usePreventBackNavigation";
import { cn } from "~/lib/utils";
import type { UserInfo } from "~/types/user";
import type { Route } from "./+types";

export async function loader({ request, context }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const dateParam = url.searchParams.get("date");
	const date = dateParam
		? formatInTimeZone(new Date(dateParam), "Asia/Tokyo", "yyyy-MM-dd")
		: formatInTimeZone(new Date(), "Asia/Tokyo", "yyyy-MM-dd");
	const notesResult = await fetchNotesWithPagination(request, context, { date: parseISO(date) });
	const notes = notesResult?.notes || [];

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
	const { isLoading } = useNavigation();

	const { notes, date, noteDays } = useLoaderData<typeof loader>() as {
		notes: Note[];
		date: string;
		noteDays: string[];
	};

	const [selectedDate, setSelectedDate] = useState<Date>(new Date(date));
	const [isSwipeActive, setIsSwipeActive] = useState(false);
	const [swipeDirection, setSwipeDirection] = useState<"horizontal" | "vertical" | null>(null);
	const { tags } = useTags();
	const { noteDays: hookNoteDays, fetchNoteDays } = useNoteDays();
	const [getCalendarDateRange, setGetCalendarDateRange] = useState<
		((newDate: Date) => { startDate: Date; endDate: Date; viewMode: ViewMode }) | null
	>(null);
	const { isOpen, imageUrl, alt, openZoom, closeZoom } = useImageZoom();

	const swipeThreshold = useMemo(() => {
		if (typeof window !== "undefined") {
			return window.innerWidth / 3;
		}
		return 150; // fallback
	}, []);

	const handleDateSelect = useCallback(
		(selected: Date) => {
			setSelectedDate(selected);
			const dateStr = format(selected, "yyyy-MM-dd");
			navigate(`?date=${dateStr}`);
		},
		[navigate],
	);

	const handleDateRangeChange = useCallback(
		(startDate: Date, endDate: Date) => {
			fetchNoteDays(startDate, endDate);
		},
		[fetchNoteDays],
	);

	const handleCalendarReady = useCallback(
		(getDateRange: (newDate: Date) => { startDate: Date; endDate: Date; viewMode: ViewMode }) => {
			setGetCalendarDateRange(() => getDateRange);
		},
		[],
	);

	const handleWeekChange = useCallback(
		(date: Date) => {
			setSelectedDate(date);
			navigate(`?date=${format(date, "yyyy-MM-dd")}`);
		},
		[navigate],
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
			navigateToDate(newDate, navigate);

			// swipe時にnoteDaysを更新（WeekCalendarから期間計算を取得）
			if (getCalendarDateRange) {
				const { startDate, endDate } = getCalendarDateRange(newDate);
				fetchNoteDays(startDate, endDate);
			}
		},
		[selectedDate, navigate, getCalendarDateRange, fetchNoteDays],
	);

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			<div className="w-full">
				<WeekCalendar
					selectedDate={selectedDate}
					onDateSelect={handleDateSelect}
					onWeekChange={handleWeekChange}
					noteDays={hookNoteDays.length > 0 ? hookNoteDays : noteDays}
					onDateRangeChange={handleDateRangeChange}
					onCalendarReady={handleCalendarReady}
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

						// 水平スワイプかつ閾値を超えた場合のみ日付変更
						if (swipeDirection === "horizontal" && horizontalDistance > swipeThreshold) {
							const direction = info.offset.x > 0 ? "right" : "left";
							handleSwipe(direction);
						}

						// 状態をリセット
						setIsSwipeActive(false);
						setSwipeDirection(null);
					},
					[swipeDirection, handleSwipe, swipeThreshold],
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
						isLoading ? (
							<div className="space-y-4">
								<LoadingState variant="spinner" className="text-center" />
							</div>
						) : (
							<>
								{notes && notes.length > 0 ? (
									<ul className="space-y-4">
										{notes.map((note) => (
											<Suspense
												key={note.noteId}
												fallback={
													<li>
														<LoadingState className="h-10 w-full" />
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
																		className={cn(
																			"rounded-xl p-2 cursor-pointer shrink-0",
																			note.accessLevel === AccessLevel.Private
																				? "bg-secondary"
																				: "bg-primary",
																		)}
																		onClick={(event) => {
																			event.stopPropagation();
																			openZoom(img, `ノート添付 #${i + 1}`);
																		}}
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
														className={cn(
															"wrap-anywhere overflow-y-auto rounded-xl mb-1 max-w-full",
															note.accessLevel === AccessLevel.Private && "cursor-pointer",
															note.contentType === NoteContentType.WineByAi && "max-h-[500px]",
														)}
														onClick={() => handleEditNote(note)}
													>
														<ClientOnly fallback={<LoadingState className="h-20 w-full" />}>
															<NoteContent note={note} />
														</ClientOnly>
													</div>
													<div className="text-xs text-muted-foreground ml-2 flex items-center gap-2">
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
					[isLoading, notes, handleEditNote, openZoom],
				)}
			</motion.section>
			<ImageZoomModal isOpen={isOpen} onClose={closeZoom} imageUrl={imageUrl} alt={alt} />
		</div>
	);
}
