import { format } from "date-fns";
import { Plus } from "lucide-react";
import { lazy, Suspense } from "react";
import { Outlet, useNavigate, useOutletContext, useSearchParams } from "react-router";
import { toast } from "sonner";
import FloatMenu from "~/components/common/floatMenu";
import { Button } from "~/components/ui/button";
import type { AccessLevel } from "~/constants/accessLevel";
import type { UserInfo } from "~/types/user";

const BlockNoteDrawer = lazy(() => import("~/components/common/.client/blockNoteDrawer"));

export default function WithPost() {
	const userInfo = useOutletContext<UserInfo | null>();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const createNote = async (params: {
		content: string;
		accessLevel: AccessLevel;
	}): Promise<void> => {
		const { content, accessLevel } = params;
		const date = searchParams.get("date");
		const targetDate = date ? new Date(date) : new Date();
		const body = JSON.stringify({
			content,
			accessLevel,
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

	return (
		<div className="flex flex-col min-h-screen">
			<main className="max-w-full pt-6 pb-25 px-6">
				<Outlet context={userInfo} />
				<div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center gap-2">
					<FloatMenu userInfo={userInfo} />
					<Suspense
						fallback={
							<Button variant="secondary">
								<Plus />
							</Button>
						}
					>
						{userInfo && <BlockNoteDrawer onSubmit={createNote} buttonLabel="Create Note" />}
					</Suspense>
				</div>
			</main>
		</div>
	);
}
