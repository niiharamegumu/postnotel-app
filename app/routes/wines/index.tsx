import { format } from "date-fns";
import { SquareArrowOutUpRight } from "lucide-react";
import { Suspense, lazy } from "react";
import { Link, useLoaderData } from "react-router";
import ClientOnly from "~/components/common/ClientOnly";
import { ImageZoomModal } from "~/components/common/ImageZoomModal";
import { LoadingState } from "~/components/common/LoadingState";
import { AccessLevel } from "~/constants/accessLevel";
import { NoteContentType } from "~/constants/noteContentType";
import { fetchNotesWithPagination } from "~/features/notes/api/get";
import type { Note } from "~/features/notes/types/note";
import { useImageZoom } from "~/hooks/useImageZoom";
import type { PaginationInfo } from "~/lib/pagination";
import { cn } from "~/lib/utils";
import type { Route } from "./+types";

export async function loader({ request, context }: Route.LoaderArgs) {
	const targetContentType = NoteContentType.WineByAi; // ワインノートを取得するためのコンテンツタイプ
	const notesResult = await fetchNotesWithPagination(request, context, {
		contentType: targetContentType,
	});

	if (!notesResult) {
		return { notes: null, paginationInfo: null };
	}

	const { notes, paginationInfo } = notesResult;
	return { notes, paginationInfo };
}

const NoteContent = lazy(() => import("~/features/notes/components/.client/content"));

export default function Index() {
	// TODO： 将来的には10件程度でページネーションを実装する
	const { notes, paginationInfo } = useLoaderData<typeof loader>() as {
		notes: Note[] | null;
		paginationInfo: PaginationInfo | null;
	};
	const { isOpen, imageUrl, alt, openZoom, closeZoom } = useImageZoom();

	return (
		<div className="max-w-2xl mx-auto py-8 space-y-10">
			<section>
				<h1 className="text-3xl font-bold mb-2">
					Wines <span className="text-muted-foreground text-sm">By AI</span>
				</h1>
				{notes && notes.length > 0 ? (
					<ul className="space-y-8">
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
									<h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
										{format(new Date(note.createdAt), "yyyy年MM月dd日 HH時mm分")}
										<Link to={`/notes?date=${format(new Date(note.createdAt), "yyyy-MM-dd")}`}>
											<SquareArrowOutUpRight />
										</Link>
									</h2>
									{note.images?.length > 0 && (
										<div className="mb-3">
											<div className="flex gap-2 flex-nowrap overflow-x-auto">
												{note.images.map((img, i) => (
													<div
														key={`${note.noteId}-img-${i}`}
														className={cn(
															"rounded-xl overflow-hidden p-2 shrink-0 cursor-pointer",
															note.accessLevel === AccessLevel.Private
																? "bg-secondary"
																: "bg-primary",
														)}
														onClick={() => openZoom(img, `ワイン画像 #${i + 1}`)}
													>
														<img
															src={img}
															alt={`ワイン画像 #${i + 1}`}
															className="w-auto h-auto max-h-[200px] object-cover rounded-xl"
														/>
													</div>
												))}
											</div>
										</div>
									)}
									<div className="wrap-anywhere max-h-[500px] overflow-y-auto rounded-xl mb-1 max-w-full">
										<ClientOnly fallback={<LoadingState className="h-20 w-full" />}>
											<NoteContent note={note} />
										</ClientOnly>
									</div>
								</li>
							</Suspense>
						))}
					</ul>
				) : (
					<p className="text-primary text-center mt-10">ワインノートがありません。</p>
				)}
			</section>
			<ImageZoomModal isOpen={isOpen} onClose={closeZoom} imageUrl={imageUrl} alt={alt} />
		</div>
	);
}
