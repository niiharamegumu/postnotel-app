import { format, parseISO } from "date-fns";
import { StatusCodes } from "http-status-codes";
import { Suspense } from "react";
import { Link, redirect, useLoaderData } from "react-router";
import { ImageZoomModal } from "~/components/common/ImageZoomModal";
import { LoadingState } from "~/components/common/LoadingState";
import { PaginationControls } from "~/components/common/PaginationControls";
import { TagLink } from "~/components/common/TagLink";
import { NoteContentType } from "~/constants/noteContentType";
import { PAGINATION_LIMITS } from "~/constants/pagination";
import { fetchNotesWithPagination } from "~/features/notes/api/get";
import type { Note } from "~/features/notes/types/note";
import { useImageZoom } from "~/hooks/useImageZoom";
import { type PaginationInfo, calculateOffset, getPageFromSearchParams } from "~/lib/pagination";
import type { Route } from "./+types/images";

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
		notes: Note[] | null;
		paginationInfo: PaginationInfo;
	};

	// Filter notes that have images
	const imageNotes = notes?.filter((note) => note.images && note.images.length > 0) || [];
	const { isOpen, imageUrl, alt, openZoom, closeZoom } = useImageZoom();

	return (
		<div className="max-w-2xl mx-auto py-8 space-y-6">
			<div className="w-full">
				<h1 className="text-3xl font-bold text-primary mb-2">Images</h1>
				<p className="text-sm text-muted-foreground">{paginationInfo.totalItems || 0}件</p>
			</div>

			<section className="w-full min-h-screen">
				{imageNotes.length > 0 ? (
					<div className="flex flex-col gap-2 md:gap-4">
						{imageNotes.map((note) => (
							<Suspense
								key={note.noteId}
								fallback={
									<div className="rounded-lg bg-card p-4">
										<LoadingState className="w-full h-32 rounded" />
									</div>
								}
							>
								<div className="rounded">
									<Link
										to={`/notes?date=${format(parseISO(note.createdAt), "yyyy-MM-dd")}`}
										className="block space-y-3"
									>
										{/* Images */}
										{note.images && note.images.length > 0 && (
											<div className="grid grid-cols-2 md:grid-cols-4 gap-[1px]">
												{note.images.map((imageUrl, index) => (
													<div
														key={`${note.noteId}-img-${index}`}
														className="aspect-square overflow-hidden cursor-pointer"
														onClick={(event) => {
															event.preventDefault();
															event.stopPropagation();
															openZoom(imageUrl, `ノート画像 ${index + 1}`);
														}}
													>
														<img
															src={imageUrl}
															alt={`ノート画像 ${index + 1}`}
															className="w-full h-full object-cover"
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
			<ImageZoomModal isOpen={isOpen} onClose={closeZoom} imageUrl={imageUrl} alt={alt} />
		</div>
	);
}
