import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { EyeOff, SquareArrowOutUpRight } from "lucide-react";
import { Suspense, lazy, useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { ImageZoomModal } from "~/components/common/ImageZoomModal";
import { LoadingState } from "~/components/common/LoadingState";
import { TagLink } from "~/components/common/TagLink";
import { AccessLevel, accessLevelLabels } from "~/constants/accessLevel";
import { noteContentTypeLabels } from "~/constants/noteContentType";
import type { Note } from "~/features/notes/types/note";
import type { Tag } from "~/features/tags/types/tag";
import { useImageZoom } from "~/hooks/useImageZoom";
import type { PaginationInfo } from "~/lib/pagination";

const NoteContent = lazy(() => import("~/features/notes/components/.client/content"));

type SearchResultsProps = {
	notes: Note[];
	availableTags: Tag[];
	paginationInfo: PaginationInfo | null;
};

function groupNotesByDate(notes: Note[]): Record<string, Note[]> {
	return notes.reduce((acc: Record<string, Note[]>, note: Note) => {
		const dateKey = format(parseISO(note.createdAt), "yyyy-MM-dd");
		if (!acc[dateKey]) {
			acc[dateKey] = [];
		}
		acc[dateKey].push(note);
		return acc;
	}, {});
}

export function SearchResults({ notes, availableTags, paginationInfo }: SearchResultsProps) {
	const [searchParams] = useSearchParams();
	const searchQuery: string = searchParams.get("q") || "";
	const { isOpen, imageUrl, alt, openZoom, closeZoom } = useImageZoom();

	// URLパラメータからselectedTagsを計算
	const selectedTagIds: string[] = searchParams.get("tagIds")?.split(",").filter(Boolean) || [];
	const selectedTags: Tag[] = useMemo(
		() => availableTags.filter((tag) => selectedTagIds.includes(tag.id)),
		[availableTags, selectedTagIds],
	);

	// メッセージをメモ化
	const emptyMessage: string = useMemo(() => {
		if (selectedTags.length > 0 && searchQuery) {
			return "選択されたタグと検索キーワードの組み合わせに該当するノートはありません";
		}
		if (selectedTags.length > 0) {
			return "選択されたタグの組み合わせに該当するノートはありません";
		}
		if (searchQuery) {
			return "検索キーワードに該当するノートはありません";
		}
		return "ノートがありません";
	}, [selectedTags.length, searchQuery]);

	// 日付グループ化とソートをメモ化
	const { groupedNotes, sortedDates } = useMemo(() => {
		if (notes.length === 0) {
			return { groupedNotes: {}, sortedDates: [] };
		}

		const grouped = groupNotesByDate(notes);
		const sorted = Object.keys(grouped).sort(
			(a, b) => new Date(b).getTime() - new Date(a).getTime(),
		);

		return { groupedNotes: grouped, sortedDates: sorted };
	}, [notes]);

	if (notes.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">{emptyMessage}</p>
			</div>
		);
	}

	return (
		<div>
			<div className="text-sm text-muted-foreground mb-2">{paginationInfo?.totalItems || 0}件</div>

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
												<div className="flex gap-[1px] flex-nowrap overflow-x-auto rounded">
													{note.images.map((img, i) => (
														<div
															key={`${note.noteId}-img-${i}`}
															className="cursor-pointer shrink-0"
														>
															<img
																src={img}
																alt={`ノート添付 #${i + 1}`}
																loading="lazy"
																decoding="async"
																className="w-auto h-auto max-h-[200px] object-cover"
																onClick={() => openZoom(img, `ノート添付 #${i + 1}`)}
															/>
														</div>
													))}
												</div>
											</div>
										)}
										<div className="wrap-anywhere overflow-y-auto rounded mb-1 max-w-full">
											<NoteContent note={note} searchQuery={searchQuery} />
										</div>
										<div className="text-xs text-muted-foreground overflow-scroll max-w-full flex items-stretch gap-2">
											<div className="flex items-center gap-2 p-2 bg-secondary rounded">
												<div>{format(new Date(note.createdAt), "HH:mm")}</div>
												<div>{noteContentTypeLabels[note.contentType]}</div>
												{note.tags && note.tags.tags.length > 0 && (
													<div className="flex items-center gap-2">
														{note.tags.tags.map((tag) => (
															<TagLink key={tag.id} id={tag.id} name={tag.name} />
														))}
													</div>
												)}
											</div>
											{note.accessLevel === AccessLevel.Private && (
												<div className="flex items-center px-2 bg-secondary rounded">
													<EyeOff size={18} />
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
			<ImageZoomModal isOpen={isOpen} onClose={closeZoom} imageUrl={imageUrl} alt={alt} />
		</div>
	);
}
