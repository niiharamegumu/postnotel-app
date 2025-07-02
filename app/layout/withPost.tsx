import { format } from "date-fns";
import { Plus } from "lucide-react";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { Outlet, useNavigate, useOutletContext, useSearchParams } from "react-router";
import { toast } from "sonner";
import { ApiResponseError } from "~/api/error/apiResponseError";
import FloatMenu from "~/components/common/floatMenu";
import { Button } from "~/components/ui/button";
import { ActionType } from "~/features/notes/constants/actionType";
import type { Note, NoteApiRequest } from "~/features/notes/types/note";
import type { UserInfo } from "~/types/user";

const BlockNoteDrawer = lazy(() => import("~/components/common/.client/blockNoteDrawer"));

export default function WithPost() {
	const userInfo = useOutletContext<UserInfo | null>();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const [loading, setLoading] = useState(false); // 処理中かどうか
	const [isNoteDrawerOpen, setNoteDrawerOpen] = useState(false); // noteのドロワーの開閉状態
	const [noteDrawerType, setNoteDrawerType] = useState<ActionType>(ActionType.Create); // noteのドロワーのタイプ
	const [targetNote, setTargetNote] = useState<Note | null>(null);

	const date = searchParams.get("date");
	const targetDate = date ? new Date(date) : new Date();

	const createNote = async (params: NoteApiRequest): Promise<void> => {
		const { content, accessLevel, images } = params;
		if (!content) return;

		const body = JSON.stringify({
			content,
			accessLevel,
			images: images,
			noteDay: format(targetDate, "yyyy-MM-dd"),
		});

		const res = await fetch("/notes/create", {
			method: "POST",
			body,
		});

		if (!res.ok) {
			throw new ApiResponseError(res.status, "ノートの作成に失敗しました");
		}

		navigate(`/notes?date=${format(targetDate, "yyyy-MM-dd")}`);
		toast.success("ノートを作成しました");
	};

	const editNote = async (params: NoteApiRequest): Promise<void> => {
		const { content, accessLevel, images } = params;
		if (!content) return;
		if (!targetNote) return;

		const body = JSON.stringify({
			content,
			accessLevel,
			images,
		});

		const res = await fetch(`/notes/${targetNote.noteId}/update`, {
			method: "POST",
			body,
		});

		if (!res.ok) {
			throw new ApiResponseError(res.status, "ノートの編集に失敗しました");
		}

		navigate(`/notes?date=${format(targetDate, "yyyy-MM-dd")}`);
		toast.success("ノートを編集しました");
	};

	let noteDrawerHandler = createNote;
	switch (noteDrawerType) {
		case ActionType.Create:
			noteDrawerHandler = createNote;
			break;
		case ActionType.Edit:
			noteDrawerHandler = editNote;
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
								setLoading={setLoading}
								open={isNoteDrawerOpen}
								setOpen={setNoteDrawerOpen}
								note={targetNote}
								targetDate={targetDate}
							/>
						</Suspense>
					)}
				</div>
			</main>
		</div>
	);
}
