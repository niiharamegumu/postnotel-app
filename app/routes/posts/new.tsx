import { format } from "date-fns";
import { StatusCodes } from "http-status-codes";
import { Suspense, lazy, useCallback, useEffect } from "react";
import { type MetaFunction, useFetcher, useNavigate, useOutletContext } from "react-router";
import { toast } from "sonner";
import ClientOnly from "~/components/common/ClientOnly";
import type { AccessLevel } from "~/constants/accessLevel";
import { endpoints } from "~/constants/endpoints";
import { NoteContentType } from "~/constants/noteContentType";
import type { PostEditorSubmitPayload } from "~/features/posts/components/PostEditor.client";
import { fetcher } from "~/lib/fetcher";
import type { UserInfo } from "~/types/user";
import type { Route } from "./+types/new";

const PostEditor = lazy(() => import("~/features/posts/components/PostEditor.client"));

export const meta: MetaFunction = () => {
	return [
		{ title: "Create Post - PostNotel" },
		{ name: "description", content: "Create a new Post" },
	];
};

export async function action({ request, context }: Route.ActionArgs) {
	try {
		const formData = await request.formData();
		const content = formData.get("content");
		const accessLevel = formData.get("accessLevel");
		const imagesValue = formData.get("images");
		const tagIdsValue = formData.get("tagIds");

		if (typeof content !== "string" || !content.trim()) {
			return Response.json(
				{ success: false, error: "Content is required" },
				{ status: StatusCodes.BAD_REQUEST },
			);
		}

		if (typeof accessLevel !== "string") {
			return Response.json(
				{ success: false, error: "Access level is required" },
				{ status: StatusCodes.BAD_REQUEST },
			);
		}

		let images: string[] = [];
		if (typeof imagesValue === "string" && imagesValue.length > 0) {
			try {
				images = JSON.parse(imagesValue) as string[];
			} catch (error) {
				console.error("Invalid images payload", error);
				return Response.json(
					{ success: false, error: "Invalid images payload" },
					{ status: StatusCodes.BAD_REQUEST },
				);
			}
		}

		let tagIds: string[] = [];
		if (typeof tagIdsValue === "string" && tagIdsValue.length > 0) {
			try {
				tagIds = JSON.parse(tagIdsValue) as string[];
			} catch (error) {
				console.error("Invalid tags payload", error);
				return Response.json(
					{ success: false, error: "Invalid tags payload" },
					{ status: StatusCodes.BAD_REQUEST },
				);
			}
		}

		const noteDay = format(new Date(), "yyyy-MM-dd");
		const body = JSON.stringify({
			content,
			accessLevel: accessLevel as AccessLevel,
			noteDay,
			images,
			tagIds,
			contentType: NoteContentType.Post,
		});

		const response = await fetcher(context, endpoints.notes.create, {
			method: "POST",
			headers: {
				Cookie: request.headers.get("cookie") || "",
			},
			body,
		});

		if (!response.ok) {
			const message = await response.text();
			console.error("Failed to create post:", message);
			return Response.json(
				{ success: false, error: "Postの作成に失敗しました" },
				{ status: response.status },
			);
		}

		const created = (await response.json()) as { noteId?: string };
		return Response.json({ success: true, noteId: created?.noteId });
	} catch (error) {
		console.error("Unexpected error while creating post:", error);
		return Response.json(
			{ success: false, error: "Postの作成に失敗しました" },
			{ status: StatusCodes.INTERNAL_SERVER_ERROR },
		);
	}
}

export default function NewPost() {
	type ActionResult = { success: boolean; error?: string; noteId?: string };
	const fetcher = useFetcher<ActionResult>();
	const navigate = useNavigate();
	const userInfo = useOutletContext<UserInfo | null>();

	useEffect(() => {
		if (fetcher.state !== "idle") return;
		const data = fetcher.data;
		if (!data) return;

		if (data.success && data.noteId) {
			toast.success("Postを作成しました");
			navigate(`/posts/${data.noteId}`);
		} else if (data.error) {
			toast.error(data.error);
		}
	}, [fetcher.state, fetcher.data, navigate]);

	const handleSubmit = useCallback(
		async ({ content, accessLevel, tagIds, images }: PostEditorSubmitPayload) => {
			const formData = new FormData();
			formData.append("content", content);
			formData.append("accessLevel", accessLevel);
			formData.append("tagIds", JSON.stringify(tagIds));
			formData.append("images", JSON.stringify(images));
			fetcher.submit(formData, { method: "post" });
		},
		[fetcher],
	);

	if (!userInfo) {
		return (
			<div className="max-w-3xl mx-auto text-muted-foreground">
				ログインするとPostを作成できます。
			</div>
		);
	}

	return (
		<div className="max-w-3xl mx-auto space-y-6">
			<h1 className="text-2xl font-semibold">Create Post</h1>
			<ClientOnly fallback={<div>Loading editor...</div>}>
				<Suspense fallback={<div>Loading editor...</div>}>
					<PostEditor
						submitting={fetcher.state !== "idle"}
						submitLabel="Create"
						onSubmit={handleSubmit}
					/>
				</Suspense>
			</ClientOnly>
		</div>
	);
}
