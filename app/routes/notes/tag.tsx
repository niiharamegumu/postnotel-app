import { lazy, Suspense } from "react";
import { useLoaderData, Link } from "react-router";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import type { Note, NotesByDateResponse } from "~/features/notes/types/note";
import type { Route } from "./+types/tag";
import { fetchNotes } from "~/features/notes/api/get";
import { fetcher } from "~/lib/fetcher";
import { endpoints } from "~/constants/endpoints";
import type { Tag as TagType, TagsResponse } from "~/features/tags/types/tag";
import { AccessLevel, accessLevelLabels } from "~/constants/accessLevel";
import { noteContentTypeLabels } from "~/constants/noteContentType";
import { Skeleton } from "~/components/ui/skeleton";
import { Tag, SquareArrowOutUpRight } from "lucide-react";
import { TagLink } from "~/components/common/TagLink";

export async function loader({ request, context, params }: Route.LoaderArgs) {
	const { tagId } = params;

	if (!tagId) {
		throw new Response("タグIDが指定されていません", { status: 400 });
	}

	// Get tag information
	const tagResponse = await fetcher(context, endpoints.tags.list, {
		headers: {
			Cookie: request.headers.get("cookie") || "",
		},
	});

	const tagsData: TagsResponse = await tagResponse.json();
	const tag = tagsData.tags.find((t) => t.id === tagId);

	if (!tag) {
		throw new Response("タグが見つかりません", { status: 404 });
	}

	// Get notes for this tag
	const notes = await fetchNotes(request, context, { tagIds: [tagId] });

	return { notes, tag, tags: tagsData.tags };
}

export function meta({ data }: Route.MetaArgs) {
	const tag = data.tag;
	return [
		{ title: `${tag?.name || "タグ"} - PostNotel Notes` },
		{ name: "description", content: `${tag?.name || "タグ"}のノート一覧` },
	];
}

const NoteContent = lazy(() => import("~/features/notes/components/.client/content"));

export default function TagNotesPage() {
	const { notes, tag, tags } = useLoaderData<typeof loader>() as {
		notes: NotesByDateResponse | null;
		tag: TagType;
		tags: TagType[];
	};

	// Group notes by date
	const groupedNotes = notes?.notes
		? notes.notes.reduce((acc: Record<string, Note[]>, note: Note) => {
				const dateKey = format(parseISO(note.createdAt), "yyyy-MM-dd");
				if (!acc[dateKey]) {
					acc[dateKey] = [];
				}
				acc[dateKey].push(note);
				return acc;
			}, {})
		: {};

	// Sort dates in descending order
	const sortedDates = Object.keys(groupedNotes).sort(
		(a, b) => new Date(b).getTime() - new Date(a).getTime(),
	);

	return (
		<Suspense fallback={<Skeleton className="h-screen w-full" />}>
			<div className="max-w-2xl mx-auto py-8 space-y-6">
				<div className="w-full">
					<div className="flex items-center gap-2 mb-2">
						<Tag size={26} color="#75b1ff" />
						<h1 className="text-3xl font-bold text-primary">{tag.name}</h1>
					</div>
					<p className="text-sm text-muted-foreground">{notes?.notes.length || 0}件</p>
				</div>
				{tags && tags.length > 0 && (
					<div className="flex justify-start flex-wrap gap-2">
						{tags.map((tag) => (
							<TagLink key={tag.id} id={tag.id} name={tag.name} />
						))}
					</div>
				)}
				<section className="w-full min-h-screen">
					{sortedDates.length > 0 ? (
						<div className="space-y-6">
							{sortedDates.map((dateKey) => (
								<div key={dateKey} className="space-y-4">
									<h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
										{format(parseISO(dateKey), "yyyy年M月d日（E）", { locale: ja })}
										<Link to={`/notes?date=${dateKey}`}>
											<SquareArrowOutUpRight />
										</Link>
									</h2>
									<ul className="space-y-4">
										{groupedNotes[dateKey].map((note: Note) => (
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
																		className={`rounded-xl p-2 shrink-0 ${
																			note.accessLevel === AccessLevel.Private
																				? "bg-secondary"
																				: "bg-primary"
																		}`}
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
													<div className="wrap-anywhere overflow-y-auto rounded-xl mb-1">
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
																{note.tags.tags.map((noteTag) => (
																	<TagLink key={noteTag.id} id={noteTag.id} name={noteTag.name} />
																))}
															</div>
														)}
													</div>
												</li>
											</Suspense>
										))}
									</ul>
								</div>
							))}
						</div>
					) : (
						<div className="flex items-center justify-center min-h-[60vh]">
							<p className="text-primary text-center">このタグのノートはありません。</p>
						</div>
					)}
				</section>
			</div>
		</Suspense>
	);
}
