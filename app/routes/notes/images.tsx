import { Suspense } from "react";
import { useLoaderData, Link, redirect } from "react-router";
import { format, parseISO } from "date-fns";
import type { NotesWithPaginationResponse } from "~/features/notes/types/note";
import type { Route } from "./+types/images";
import { fetchNotesWithPagination } from "~/features/notes/api/get";
import { LoadingState } from "~/components/common/LoadingState";
import { NoteContentType } from "~/constants/noteContentType";
import { PaginationControls } from "~/components/common/PaginationControls";
import { getPageFromSearchParams, calculateOffset, type PaginationInfo } from "~/lib/pagination";
import { PAGINATION_LIMITS } from "~/constants/pagination";
import { StatusCodes } from "http-status-codes";
import { TagLink } from "~/components/common/TagLink";

export async function loader({ request, context }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const searchParams = url.searchParams;
	const page = getPageFromSearchParams(searchParams);
	const limit = PAGINATION_LIMITS.IMAGES_PAGE;
	const offset = calculateOffset(page, limit);

	// Get image notes with pagination
	const notesResult = await fetchNotesWithPagination(request, context, {
		hasImages: true,
		contentType: NoteContentType.Note,
		limit,
		offset,
	});

	if (!notesResult) {
		throw new Response("ノートの取得に失敗しました", { status: StatusCodes.INTERNAL_SERVER_ERROR });
	}

	const { notes, paginationInfo } = notesResult;

	// If page is invalid (beyond total pages), redirect to page 1
	if (page > paginationInfo.totalPages && paginationInfo.totalPages > 0) {
		const redirectUrl = new URL(request.url);
		redirectUrl.searchParams.delete("page");
		throw redirect(redirectUrl.toString());
	}

	return {
		notes,
		paginationInfo,
	};
}

export function meta() {
	return [{ title: "Images - PostNotel" }, { name: "description", content: "Note Images" }];
}

export default function ImagesPage() {
	const { notes, paginationInfo } = useLoaderData<typeof loader>() as {
		notes: NotesWithPaginationResponse | null;
		paginationInfo: PaginationInfo;
	};

	// Filter notes that have images
	const imageNotes = notes?.notes?.filter((note) => note.images && note.images.length > 0) || [];

	return (
		<div className="max-w-2xl mx-auto py-8 space-y-6">
			<div className="w-full">
				<h1 className="text-3xl font-bold text-primary mb-2">Images</h1>
				<p className="text-sm text-muted-foreground">{paginationInfo.totalItems || 0}件</p>
			</div>

			<section className="w-full min-h-screen">
				{imageNotes.length > 0 ? (
					<div className="flex flex-col gap-6">
						{imageNotes.map((note) => (
							<Suspense
								key={note.noteId}
								fallback={
									<div className="rounded-lg bg-card p-4">
										<LoadingState className="w-full h-32 rounded" />
									</div>
								}
							>
								<div className="rounded-lg bg-card p-4 hover:bg-accent transition-colors">
									<Link
										to={`/notes?date=${format(parseISO(note.createdAt), "yyyy-MM-dd")}`}
										className="block space-y-3"
									>
										{/* Images */}
										{note.images && note.images.length > 0 && (
											<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
												{note.images.map((imageUrl, index) => (
													<div
														key={`${note.noteId}-img-${index}`}
														className="aspect-square rounded-md overflow-hidden bg-primary/20 p-1"
													>
														<img
															src={imageUrl}
															alt={`ノート画像 ${index + 1}`}
															className="w-full h-full object-cover rounded"
															loading="lazy"
															decoding="async"
														/>
													</div>
												))}
											</div>
										)}

										{/* Note metadata */}
										<div className="flex items-center gap-2 text-xs text-muted-foreground">
											<span>{format(parseISO(note.createdAt), "yyyy年M月d日 HH:mm")}</span>
											{note.tags && note.tags.tags.length > 0 && (
												<div className="flex gap-1">
													{note.tags.tags.map((tag) => (
														<TagLink key={tag.id} id={tag.id} name={tag.name} size={10} />
													))}
												</div>
											)}
										</div>
									</Link>
								</div>
							</Suspense>
						))}
					</div>
				) : (
					<div className="flex items-center justify-center min-h-[60vh]">
						<p className="text-primary text-center">画像付きノートはありません。</p>
					</div>
				)}
			</section>

			{paginationInfo.totalPages > 1 && (
				<PaginationControls pagination={paginationInfo} baseUrl="/notes/images" />
			)}
		</div>
	);
}
