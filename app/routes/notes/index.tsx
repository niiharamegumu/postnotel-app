import { lazy, Suspense, useState } from "react";
import { useLoaderData, useNavigate, useNavigation } from "react-router";
import { Calendar } from "~/components/ui/calendar";
import { is, ja } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import type { NotesByDateResponse } from "~/features/notes/types/note";
import type { Route } from "./+types";
import { fetchDays, fetchNotesByDate } from "~/features/notes/api/get";
import { AccessLevel, accessLevelLabels } from "~/constants/accessLevel";
import { formatInTimeZone } from "date-fns-tz";
import { Skeleton } from "~/components/ui/skeleton";

export async function loader({ request, context }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const dateParam = url.searchParams.get("date");
	const date = dateParam
		? formatInTimeZone(new Date(dateParam), "Asia/Tokyo", "yyyy-MM-dd")
		: formatInTimeZone(new Date(), "Asia/Tokyo", "yyyy-MM-dd");
	const notes = await fetchNotesByDate(request, context, parseISO(date));
	const noteDays = await fetchDays(request, context);
	return { notes, date, noteDays };
}

export function meta() {
	return [{ title: "PostNotel Notes" }, { name: "description", content: "PostNotel Notes" }];
}

const NoteContent = lazy(() => import("~/features/notes/components/.client/content"));

export default function Index() {
	const navigate = useNavigate();
	const navigation = useNavigation();
	const isLoading = navigation.state === "loading";
	const { notes, date, noteDays } = useLoaderData<typeof loader>() as {
		notes: NotesByDateResponse | null;
		date: string;
		noteDays: string[];
	};
	const [selectedDate, setSelectedDate] = useState<Date>(new Date(date));

	const handleSelect = (selected: Date | undefined) => {
		if (selected) {
			setSelectedDate(selected);
			const dateStr = format(selected, "yyyy-MM-dd");
			navigate(`?date=${dateStr}`);
		}
	};

	return (
		<Suspense fallback={<Skeleton className="h-screen w-full" />}>
			<div className="flex flex-col md:flex-row md:gap-8">
				<div className="w-auto">
					<Calendar
						mode="single"
						selected={selectedDate}
						onSelect={handleSelect}
						locale={ja}
						formatters={{
							formatCaption: (month: Date) => format(month, "yyyy年M月", { locale: ja }),
						}}
						modifiers={{
							hasNote: (date) => noteDays.some((d) => d === format(date, "yyyy-MM-dd")),
						}}
						modifiersClassNames={{
							hasNote: "bg-green-300 text-green-600",
						}}
						className="p-0"
						classNames={{
							head_row: "flex w-full justify-between",
							row: "flex w-full justify-between",
							day_today: "bg-none text-destructive",
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
													<div className="mb-1">
														{note.images.map((img, i) => (
															<div
																key={`${note.noteId}-img-${i}`}
																className="rounded-xl overflow-hidden bg-secondary p-2"
															>
																<img
																	src={img}
																	alt={`ノート添付 #${i + 1}`}
																	className="w-48 h-auto object-cover rounded-xl"
																/>
															</div>
														))}
													</div>
												)}
												<NoteContent note={note} />
												<span className="text-xs text-muted-foreground ml-2">
													{format(new Date(note.createdAt), "HH:mm")}
													{note.accessLevel === AccessLevel.Private && (
														<span className="ms-2">{accessLevelLabels[note.accessLevel]}</span>
													)}
												</span>
											</li>
										</Suspense>
									))}
								</ul>
							) : (
								<p className="text-primary">ノートがありません。</p>
							)}
						</>
					)}
				</section>
			</div>
		</Suspense>
	);
}
