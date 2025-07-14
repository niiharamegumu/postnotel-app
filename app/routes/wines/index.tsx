import { fetchNotes } from "~/features/notes/api/get";
import type { Route } from "./+types";
import { lazy, Suspense } from "react";
import { Link, useLoaderData } from "react-router";
import type { NotesByDateResponse } from "~/features/notes/types/note";
import { format } from "date-fns";
import { Skeleton } from "~/components/ui/skeleton";
import { AccessLevel } from "~/constants/accessLevel";
import { NoteContentType } from "~/constants/noteContentType";
import { SquareArrowOutUpRight } from "lucide-react";
import ClientOnly from "~/components/common/ClientOnly";
import { cn } from "~/lib/utils";

export async function loader({ request, context }: Route.LoaderArgs) {
	const targetContentType = NoteContentType.WineByAi; // ワインノートを取得するためのコンテンツタイプ
	// TODO： 将来的には10件程度でページネーションを実装する
	const notes = await fetchNotes(request, context, { contentType: targetContentType });
	return { notes };
}

const NoteContent = lazy(() => import("~/features/notes/components/.client/content"));

export default function Index() {
	const { notes } = useLoaderData<typeof loader>() as {
		notes: NotesByDateResponse | null;
	};

	return (
		<div className="max-w-2xl mx-auto py-8 space-y-10">
			<section>
				<h1 className="text-3xl font-bold">
					Wines <span className="text-muted-foreground text-sm">By AI</span>
				</h1>
			</section>

			<section>
				{notes && notes.notes.length > 0 ? (
					<ul className="space-y-8">
						{notes.notes.map((note) => (
							<Suspense
								key={note.noteId}
								fallback={
									<li>
										<Skeleton className="h-10 w-1/2" />
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
															"rounded-xl overflow-hidden p-2 shrink-0",
															note.accessLevel === AccessLevel.Private
																? "bg-secondary"
																: "bg-primary",
														)}
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
									<div className="wrap-anywhere max-h-[500px] overflow-y-auto rounded-xl mb-1">
										<ClientOnly fallback={<Skeleton className="h-20 w-1/2" />}>
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
		</div>
	);
}
