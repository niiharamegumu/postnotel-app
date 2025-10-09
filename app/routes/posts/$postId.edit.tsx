import { StatusCodes } from "http-status-codes";
import { Suspense, lazy, useCallback, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import {
	Form,
	Link,
	type MetaFunction,
	useActionData,
	useLoaderData,
	useNavigate,
	useNavigation,
	useOutletContext,
	useRevalidator,
} from "react-router";
import { toast } from "sonner";
import ClientOnly from "~/components/common/ClientOnly";
import { Button } from "~/components/ui/button";
import type { AccessLevel } from "~/constants/accessLevel";
import { endpoints } from "~/constants/endpoints";
import { NoteContentType } from "~/constants/noteContentType";
import type { PostEditorSubmitPayload } from "~/features/posts/components/PostEditor.client";
import type { Post } from "~/features/posts/types/post";
import { fetcher } from "~/lib/fetcher";
import type { UserInfo } from "~/types/user";
import type { Route } from "./+types/$postId.edit";

const PostEditor = lazy(() => import("~/features/posts/components/PostEditor.client"));

export { loader } from "./$postId";

export const meta: MetaFunction = () => {
	return [
		{ title: "Edit Post - PostNotel" },
		{ name: "description", content: "Edit existing post" },
	];
};

type LoaderData = {
	post: Post;
};

type ActionResult = {
	success: boolean;
	error?: string;
	deleted?: boolean;
};

export async function action({ request, context, params }: Route.ActionArgs) {
	const badRequest = (error: string) => {
		return Response.json({ success: false, error }, { status: StatusCodes.BAD_REQUEST });
	};

	const serverError = (error: string) => {
		return Response.json({ success: false, error }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
	};

	const { postId } = params;
	if (!postId) {
		return badRequest("Invalid post id");
	}

	const method = request.method.toUpperCase();

	if (method === "DELETE") {
		try {
			const response = await fetcher(context, endpoints.notes.delete(postId), {
				method: "DELETE",
				headers: {
					Cookie: request.headers.get("cookie") || "",
				},
			});

			if (!response.ok) {
				const message = await response.text();
				console.error("Failed to delete post:", message);
				return Response.json(
					{ success: false, error: "Postの削除に失敗しました" },
					{ status: response.status },
				);
			}

			return Response.json({ success: true, deleted: true });
		} catch (error) {
			console.error("Unexpected error while deleting post:", error);
			return serverError("Postの削除に失敗しました");
		}
	}

	if (method === "PATCH") {
		const formData = await request.formData();
		const content = formData.get("content");
		const accessLevel = formData.get("accessLevel");
		const imagesValue = formData.get("images");
		const tagIdsValue = formData.get("tagIds");

		if (typeof content !== "string" || !content.trim()) {
			return badRequest("Content is required");
		}

		if (typeof accessLevel !== "string") {
			return badRequest("Access level is required");
		}

		let images: string[] = [];
		if (typeof imagesValue === "string" && imagesValue.length > 0) {
			try {
				images = JSON.parse(imagesValue) as string[];
			} catch (error) {
				console.error("Invalid images payload", error);
				return badRequest("Invalid images payload");
			}
		}

		let tagIds: string[] = [];
		if (typeof tagIdsValue === "string" && tagIdsValue.length > 0) {
			try {
				tagIds = JSON.parse(tagIdsValue) as string[];
			} catch (error) {
				console.error("Invalid tags payload", error);
				return badRequest("Invalid tags payload");
			}
		}

		try {
			const body = JSON.stringify({
				content,
				accessLevel: accessLevel as AccessLevel,
				images,
				tagIds,
				contentType: NoteContentType.Post,
			});

			const response = await fetcher(context, endpoints.notes.update(postId), {
				method: "PATCH",
				headers: {
					Cookie: request.headers.get("cookie") || "",
				},
				body,
			});

			if (!response.ok) {
				const message = await response.text();
				console.error("Failed to update post:", message);
				return Response.json(
					{ success: false, error: "Postの更新に失敗しました" },
					{ status: response.status },
				);
			}

			return Response.json({ success: true });
		} catch (error) {
			console.error("Unexpected error while updating post:", error);
			return serverError("Postの更新に失敗しました");
		}
	}

	return badRequest("Unsupported method");
}

export default function PostEdit() {
	const { post } = useLoaderData<LoaderData>();
	const userInfo = useOutletContext<UserInfo | null>();
	const navigate = useNavigate();
	const revalidator = useRevalidator();
	const actionData = useActionData<ActionResult>();
	const navigation = useNavigation();
	const updateFormRef = useRef<HTMLFormElement>(null);
	const currentFormMethod = navigation.formMethod?.toLowerCase();
	const isSubmittingUpdate = navigation.state !== "idle" && currentFormMethod === "patch";
	const isDeleting = navigation.state !== "idle" && currentFormMethod === "delete";

	useEffect(() => {
		if (!actionData) return;
		if (actionData.success) {
			if (actionData.deleted) {
				toast.success("Postを削除しました");
				navigate("/posts");
				return;
			}
			toast.success("Postを更新しました");
			revalidator.revalidate();
		} else if (actionData.error) {
			toast.error(actionData.error);
		}
	}, [actionData, navigate, revalidator]);

	const handleSubmit = useCallback(
		async ({ content, accessLevel, tagIds, images }: PostEditorSubmitPayload) => {
			const form = updateFormRef.current;
			if (!form) return;

			const setFieldValue = (name: string, value: string) => {
				const control = form.elements.namedItem(name) as HTMLInputElement | null;
				if (control) {
					control.value = value;
				}
			};

			setFieldValue("content", content);
			setFieldValue("accessLevel", accessLevel);
			setFieldValue("tagIds", JSON.stringify(tagIds));
			setFieldValue("images", JSON.stringify(images));

			form.requestSubmit();
		},
		[],
	);

	const handleDeleteSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
		if (window.confirm("Postを削除しますか？")) return;
		event.preventDefault();
	}, []);

	if (!userInfo) {
		return (
			<div className="max-w-3xl mx-auto space-y-6">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-semibold">Edit Post</h1>
					<Link to={`/posts/${post.noteId}`} className="text-sm text-primary underline">
						Back to detail
					</Link>
				</div>
				<div className="text-muted-foreground">ログインしているユーザーのみが編集できます。</div>
			</div>
		);
	}

	return (
		<div className="max-w-3xl mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Edit Post</h1>
					<div className="text-sm text-muted-foreground">
						Updated {new Date(post.updatedAt).toLocaleString("ja-JP")}
					</div>
				</div>
				<Link to={`/posts/${post.noteId}`} className="text-sm text-primary underline">
					Back to detail
				</Link>
		</div>

		<Form ref={updateFormRef} method="patch">
			<input type="hidden" name="content" defaultValue="" />
			<input type="hidden" name="accessLevel" defaultValue="" />
			<input type="hidden" name="tagIds" defaultValue="" />
			<input type="hidden" name="images" defaultValue="" />
			<ClientOnly fallback={<div>Loading editor...</div>}>
				<Suspense fallback={<div>Loading editor...</div>}>
					<PostEditor
						post={post}
						submitting={isSubmittingUpdate}
						submitLabel="Update"
						onSubmit={handleSubmit}
					/>
				</Suspense>
			</ClientOnly>
		</Form>

		<div className="flex items-center gap-2">
			<Button variant="outline" type="button" onClick={() => navigate(`/posts/${post.noteId}`)}>
				キャンセル
			</Button>
			<Form method="delete" onSubmit={handleDeleteSubmit}>
				<Button variant="destructive" type="submit" disabled={isDeleting}>
					{isDeleting ? "Deleting..." : "Delete"}
				</Button>
			</Form>
		</div>
	</div>
);
}
