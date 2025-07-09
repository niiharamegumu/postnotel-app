import { Suspense } from "react";
import { useLoaderData, Link } from "react-router";
import { format, parseISO } from "date-fns";
import type { NotesByDateResponse } from "~/features/notes/types/note";
import type { Route } from "./+types/images";
import { fetchNotes } from "~/features/notes/api/get";
import { Skeleton } from "~/components/ui/skeleton";

export async function loader({ request, context }: Route.LoaderArgs) {
	const notes = await fetchNotes(request, context, { hasImages: true });
	return { notes };
}

export function meta() {
	return [{ title: "Images - PostNotel" }, { name: "description", content: "Note Images" }];
}

export default function ImagesPage() {
	const { notes } = useLoaderData<typeof loader>() as {
		notes: NotesByDateResponse | null;
	};

	// Filter notes that have images and collect all images
	const imageNotes = notes?.notes?.filter((note) => note.images && note.images.length > 0) || [];

	// Create image entries with note reference
	const imageEntries = imageNotes.flatMap(
		(note) =>
			note.images?.map((imageUrl: string) => ({
				imageUrl,
				noteId: note.noteId,
				createdAt: note.createdAt,
				dateKey: format(parseISO(note.createdAt), "yyyy-MM-dd"),
			})) || [],
	);

	return (
		<Suspense fallback={<Skeleton className="h-screen w-full" />}>
			<div className="max-w-2xl mx-auto py-8 space-y-6">
				<div className="w-full">
					<h1 className="text-3xl font-bold text-primary mb-2">Images</h1>
					<p className="text-sm text-muted-foreground">{imageEntries.length}件</p>
				</div>
				<section className="w-full min-h-screen">
					{imageEntries.length > 0 ? (
						<div className="grid grid-cols-2 md:grid-cols-4 gap-1">
							{imageEntries.map((entry, index) => (
								<Link
									key={`${entry.noteId}-${index}`}
									to={`/notes?date=${entry.dateKey}`}
									className="block aspect-square rounded hover:opacity-80 transition-opacity bg-primary p-1"
								>
									<img
										src={entry.imageUrl}
										alt=""
										className="w-full h-full object-cover"
										loading="lazy"
										decoding="async"
									/>
								</Link>
							))}
						</div>
					) : (
						<div className="flex items-center justify-center min-h-[60vh]">
							<p className="text-primary text-center">画像付きノートはありません。</p>
						</div>
					)}
				</section>
			</div>
		</Suspense>
	);
}
