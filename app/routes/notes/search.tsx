import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { StatusCodes } from "http-status-codes";
import { Search, SquareArrowOutUpRight, Tag } from "lucide-react";
import { Suspense, lazy } from "react";
import { Link, redirect, useLoaderData } from "react-router";
import { LoadingState } from "~/components/common/LoadingState";
import { PaginationControls } from "~/components/common/PaginationControls";
import { TagLink } from "~/components/common/TagLink";
import { AccessLevel, accessLevelLabels } from "~/constants/accessLevel";
import { endpoints } from "~/constants/endpoints";
import { noteContentTypeLabels } from "~/constants/noteContentType";
import { PAGINATION_LIMITS } from "~/constants/pagination";
import { fetchNotesWithPagination } from "~/features/notes/api/get";
import type { Note, NotesWithPaginationResponse } from "~/features/notes/types/note";
import type { Tag as TagType, TagsResponse } from "~/features/tags/types/tag";
import { fetcher } from "~/lib/fetcher";
import { type PaginationInfo, calculateOffset, getPageFromSearchParams } from "~/lib/pagination";
import type { Route } from "./+types/search";

export async function loader({ request, context }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const searchParams = url.searchParams;
	const tagIdsParam = searchParams.get("tagIds");
	const page = getPageFromSearchParams(searchParams);
	const limit = PAGINATION_LIMITS.TAGS_PAGE;
	const offset = calculateOffset(page, limit);

	const tagIds = tagIdsParam ? tagIdsParam.split(",").filter(Boolean) : [];

	// Get all available tags
	const tagsResponse = await fetcher(context, endpoints.tags.list, {
		headers: {
			Cookie: request.headers.get("cookie") || "",
		},
	});

	const tagsData: TagsResponse = await tagsResponse.json();

	// Validate selected tag IDs
	const validTagIds = tagIds.filter((id) => tagsData.tags.some((tag) => tag.id === id));

	// If there are invalid tag IDs, redirect to clean URL
	if (tagIds.length !== validTagIds.length && validTagIds.length > 0) {
		const newUrl = new URL(request.url);
		newUrl.searchParams.set("tagIds", validTagIds.join(","));
		throw redirect(newUrl.toString());
	}
	if (tagIds.length !== validTagIds.length && validTagIds.length === 0) {
		const newUrl = new URL(request.url);
		newUrl.searchParams.delete("tagIds");
		throw redirect(newUrl.toString());
	}

	// Fetch notes if tags are selected
	let notesResult = null;
	if (validTagIds.length > 0) {
		notesResult = await fetchNotesWithPagination(request, context, {
			tagIds: validTagIds,
			limit,
			offset,
		});
	}

	// If page is invalid (beyond total pages), redirect to page 1
	if (
		notesResult &&
		page > notesResult.paginationInfo.totalPages &&
		notesResult.paginationInfo.totalPages > 0
	) {
		const redirectUrl = new URL(request.url);
		redirectUrl.searchParams.delete("page");
		throw redirect(redirectUrl.toString());
	}

	return {
		notes: notesResult?.notes || [],
		selectedTags: tagsData.tags.filter((tag) => validTagIds.includes(tag.id)),
		availableTags: tagsData.tags,
		paginationInfo: notesResult?.paginationInfo || null,
	};
}

export function meta({ data }: Route.MetaArgs) {
	const selectedTags = data?.selectedTags || [];
	const title =
		selectedTags.length > 0
			? `${selectedTags.map((tag) => tag.name).join(", ")} - PostNotel Notes`
			: "検索 - PostNotel Notes";

	return [{ title }, { name: "description", content: "タグでノートを検索" }];
}

const NoteContent = lazy(() => import("~/features/notes/components/.client/content"));

export default function SearchPage() {
	const { notes, selectedTags, availableTags, paginationInfo } = useLoaderData<typeof loader>() as {
		notes: Note[];
		selectedTags: TagType[];
		availableTags: TagType[];
		paginationInfo: PaginationInfo | null;
	};

	// Group notes by date
	const groupedNotes =
		notes && notes.length > 0
			? notes.reduce((acc: Record<string, Note[]>, note: Note) => {
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
		<div className="max-w-2xl mx-auto py-8 space-y-6">
			<div className="w-full">
				<div className="flex items-center gap-2 mb-2">
					<Search size={26} color="#75b1ff" />
					<h1 className="text-3xl font-bold text-primary">ノート検索</h1>
				</div>
				{selectedTags.length > 0 && (
					<div className="space-y-2">
						<div className="flex flex-wrap gap-2">
							{selectedTags.map((tag) => (
								<span
									key={tag.id}
									className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
								>
									<Tag size={12} />
									{tag.name}
								</span>
							))}
						</div>
						<p className="text-sm text-muted-foreground">
							{paginationInfo?.totalItems || 0}件のノートが見つかりました
						</p>
					</div>
				)}
			</div>

			{availableTags && availableTags.length > 0 && (
				<div className="flex justify-start flex-wrap gap-x-3 gap-y-2">
					{availableTags.map((tag) => (
						<TagLink key={tag.id} id={tag.id} name={tag.name} />
					))}
				</div>
			)}

			<section className="w-full min-h-screen">
				{selectedTags.length === 0 ? (
					<div className="flex items-center justify-center min-h-[60vh]">
						<p className="text-primary text-center">タグを選択してノートを検索してください</p>
					</div>
				) : notes.length === 0 ? (
					<div className="flex items-center justify-center min-h-[60vh]">
						<p className="text-primary text-center">
							選択されたタグの組み合わせに該当するノートはありません
						</p>
					</div>
				) : (
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
												<div className="wrap-anywhere overflow-y-auto rounded-xl mb-1 max-w-full">
													<NoteContent note={note} />
												</div>
												<div className="text-xs text-muted-foreground ml-2 flex gap-2 items-center">
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
				)}
			</section>

			{paginationInfo && paginationInfo.totalPages > 1 && (
				<PaginationControls pagination={paginationInfo} baseUrl="/notes/search" />
			)}
		</div>
	);
}
