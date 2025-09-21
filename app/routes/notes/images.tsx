import { format, parseISO } from "date-fns";
import { StatusCodes } from "http-status-codes";
import { Link, redirect, useLoaderData } from "react-router";
import { ImageZoomModal } from "~/components/common/ImageZoomModal";
import { PaginationControls } from "~/components/common/PaginationControls";
import { PAGINATION_LIMITS } from "~/constants/pagination";
import { fetchNoteImagesWithPagination } from "~/features/image/api/get";
import type { NoteImage } from "~/features/image/types/image";
import { useImageZoom } from "~/hooks/useImageZoom";
import { type PaginationInfo, calculateOffset, getPageFromSearchParams } from "~/lib/pagination";
import type { Route } from "./+types/images";
import { NoteContentType } from "~/constants/noteContentType";

export async function loader({ request, context }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const searchParams = url.searchParams;
	const page = getPageFromSearchParams(searchParams);
	const limit = PAGINATION_LIMITS.IMAGES_PAGE;
	const offset = calculateOffset(page, limit);

	const noteImagesResult = await fetchNoteImagesWithPagination(request, context, {
		contentType: NoteContentType.Note,
		limit,
		offset,
	});

	if (!noteImagesResult) {
		throw new Response("画像の取得に失敗しました", { status: StatusCodes.INTERNAL_SERVER_ERROR });
	}

	const { noteImages, paginationInfo } = noteImagesResult;

	if (page > paginationInfo.totalPages && paginationInfo.totalPages > 0) {
		const redirectUrl = new URL(request.url);
		redirectUrl.searchParams.delete("page");
		throw redirect(redirectUrl.toString());
	}

	return {
		noteImages,
		paginationInfo,
	};
}

export function meta() {
	return [{ title: "Images - PostNotel" }, { name: "description", content: "Note Images" }];
}

export default function ImagesPage() {
	const { noteImages, paginationInfo } = useLoaderData<typeof loader>() as {
		noteImages: NoteImage[];
		paginationInfo: PaginationInfo;
	};

	const { isOpen, imageUrl, alt, overlayContent, openZoom, closeZoom } = useImageZoom();

	return (
		<div className="max-w-2xl mx-auto py-8 space-y-6">
			<div className="w-full">
				<h1 className="text-3xl font-bold text-primary mb-2">Images</h1>
				<p className="text-sm text-muted-foreground">{paginationInfo.totalItems || 0}件</p>
			</div>

			<section className="w-full min-h-screen">
				{noteImages.length > 0 ? (
					<div className="grid grid-cols-2 md:grid-cols-5 gap-[1px]">
						{noteImages.map((noteImage) => {
							const createdDate = parseISO(noteImage.note.createdAt);
							const displayDate = format(createdDate, "yyyy年M月d日 HH:mm");
							const dateParam = format(createdDate, "yyyy-MM-dd");
							return (
								<div key={noteImage.noteImageId}>
									<button
										type="button"
										className="group relative block aspect-square w-full overflow-hidden bg-muted"
										onClick={() =>
											openZoom(
												noteImage.imageUrl,
												`ノート画像 ${displayDate}`,
												<Link
													to={`/notes?date=${dateParam}`}
													className="flex items-center text-primary"
												>
													{format(createdDate, "yyyy年MM月dd日 HH:mm")}
												</Link>,
											)
										}
										aria-label={`ノート画像 ${displayDate}`}
									>
										<img
											src={noteImage.imageUrl}
											alt={`ノート画像 ${displayDate}`}
											className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105 cursor-pointer"
											loading="lazy"
											decoding="async"
										/>
									</button>
								</div>
							);
						})}
					</div>
				) : (
					<div className="flex items-center justify-center min-h-[60vh]">
						<p className="text-primary text-center">画像はありません。</p>
					</div>
				)}
			</section>

			{paginationInfo.totalPages > 1 && (
				<PaginationControls pagination={paginationInfo} baseUrl="/notes/images" />
			)}
			<ImageZoomModal
				isOpen={isOpen}
				onClose={closeZoom}
				imageUrl={imageUrl}
				alt={alt}
				overlayContent={overlayContent}
			/>
		</div>
	);
}
