import { Plus } from "lucide-react";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { Outlet, useOutletContext, useSearchParams } from "react-router";
import FloatMenu from "~/components/common/floatMenu";
import { Button } from "~/components/ui/button";
import { ActionType } from "~/features/notes/constants/actionType";
import type { Note, NoteApiRequest } from "~/features/notes/types/note";
import type { UserInfo } from "~/types/user";
import { useNotes } from "~/features/notes/hooks/useNotes";
import ClientOnly from "~/components/common/ClientOnly";

const BlockNoteDrawer = lazy(() => import("~/components/common/.client/blockNoteDrawer"));

export default function WithPost() {
	const userInfo = useOutletContext<UserInfo | null>();
	const [searchParams] = useSearchParams();
	const { createNote, updateNote, loading } = useNotes();

	const [isNoteDrawerOpen, setNoteDrawerOpen] = useState(false); // noteのドロワーの開閉状態
	const [noteDrawerType, setNoteDrawerType] = useState<ActionType>(ActionType.Create); // noteのドロワーのタイプ
	const [targetNote, setTargetNote] = useState<Note | null>(null);

	const date = searchParams.get("date");
	const targetDate = date ? new Date(date) : new Date();

	const handleCreateNote = async (params: NoteApiRequest): Promise<void> => {
		await createNote(params, targetDate);
	};

	const handleEditNote = async (params: NoteApiRequest): Promise<void> => {
		if (!targetNote) return;
		await updateNote(targetNote.noteId, params, targetDate);
	};

	let noteDrawerHandler = handleCreateNote;
	switch (noteDrawerType) {
		case ActionType.Create:
			noteDrawerHandler = handleCreateNote;
			break;
		case ActionType.Edit:
			noteDrawerHandler = handleEditNote;
			break;
	}

	const onClickEditNote = useCallback(
		(note: Note) => {
			if (!userInfo) return;
			setTargetNote(note);
			setNoteDrawerType(ActionType.Edit);
			setNoteDrawerOpen(true);
		},
		[userInfo],
	);

	const contextValue = useMemo(
		() => ({
			userInfo,
			onClickEditNote,
		}),
		[userInfo, onClickEditNote],
	);

	return (
		<div className="flex flex-col min-h-screen">
			<main className="max-w-full pt-6 pb-25 px-6">
				<Outlet context={contextValue} />
				<div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center gap-2">
					<FloatMenu userInfo={userInfo} />
					{userInfo && (
						<ClientOnly
							fallback={
								<Button className="border-solid border-secondary border-1">
									<Plus />
								</Button>
							}
						>
							<Suspense
								fallback={
									<Button className="border-solid border-secondary border-1">
										<Plus />
									</Button>
								}
							>
								<BlockNoteDrawer
									onSubmit={noteDrawerHandler}
									noteDrawerType={noteDrawerType}
									setNoteDrawerType={setNoteDrawerType}
									loading={loading}
									open={isNoteDrawerOpen}
									setOpen={setNoteDrawerOpen}
									note={targetNote}
									targetDate={targetDate}
								/>
							</Suspense>
						</ClientOnly>
					)}
				</div>
			</main>
		</div>
	);
}
