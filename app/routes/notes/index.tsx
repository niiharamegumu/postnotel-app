import { lazy, Suspense, useState } from "react";
import { useLoaderData, useNavigate, useNavigation, useOutletContext } from "react-router";
import { Calendar } from "~/components/ui/calendar";
import { ja } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import type { Note, NotesByDateResponse } from "~/features/notes/types/note";
import type { Route } from "./+types";
import { fetchDays, fetchNotes } from "~/features/notes/api/get";
import { AccessLevel, accessLevelLabels } from "~/constants/accessLevel";
import { formatInTimeZone } from "date-fns-tz";
import { Skeleton } from "~/components/ui/skeleton";
import type { UserInfo } from "~/types/user";
import { noteContentTypeLabels } from "~/constants/noteContentType";

export async function loader({ request, context }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const dateParam = url.searchParams.get("date");
	const date = dateParam
		? formatInTimeZone(new Date(dateParam), "Asia/Tokyo", "yyyy-MM-dd")
		: formatInTimeZone(new Date(), "Asia/Tokyo", "yyyy-MM-dd");
	const notes = await fetchNotes(request, context, { date: parseISO(date) });
	const noteDays = await fetchDays(request, context);
	return { notes, date, noteDays };
}

export function meta() {
	return [{ title: "PostNotel Notes" }, { name: "description", content: "PostNotel Notes" }];
}

const NoteContent = lazy(() => import("~/features/notes/components/.client/content"));

export default function Index() {
	const { userInfo, onClickEditNote } = useOutletContext<{
		userInfo: UserInfo | null;
		onClickEditNote: (note: Note) => void;
	}>();

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

	const handleEditNote = (note: Note) => {
		if (!userInfo) return;
		onClickEditNote(note);
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
						onMonthChange={setCurrentMonth}
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
				</div>
				<section className="w-full">
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
												<span className="text-xs text-muted-foreground ml-2">
													{format(new Date(note.createdAt), "HH:mm")}
													{note.accessLevel === AccessLevel.Private && (
														<span className="ms-2">{accessLevelLabels[note.accessLevel]}</span>
													)}
													<span className="ms-2">{noteContentTypeLabels[note.contentType]}</span>
												</span>
											</li>
										</Suspense>
									))}
								</ul>
							) : (
								<p className="text-primary text-center mt-10">ノートがありません。</p>
							)}
						</>
					)}
				</section>
			</div>
		</Suspense>
	);
}
