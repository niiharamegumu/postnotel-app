import { Plus } from "lucide-react";
import { lazy, Suspense } from "react";
import { Outlet, useOutletContext } from "react-router";
import FloatMenu from "~/components/common/floatMenu";
import { Button } from "~/components/ui/button";
import type { UserInfo } from "~/types/user";

const BlockNoteDrawer = lazy(() => import("~/components/common/.client/blockNoteDrawer"));

export default function WithPost() {
	const userInfo = useOutletContext<UserInfo | null>();

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
						{userInfo && <BlockNoteDrawer />}
					</Suspense>
				</div>
			</main>
		</div>
	);
}
