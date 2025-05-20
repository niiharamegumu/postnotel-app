import { Outlet, useOutletContext } from "react-router";
import BlockNoteDrawer from "~/components/common/.client/blockNoteDrawer";
import FloatMenu from "~/components/common/floatMenu";
import type { UserInfo } from "~/types/user";

export default function WithPost() {
	const userInfo = useOutletContext<UserInfo | null>();
	const isClient = typeof window !== "undefined";

	return (
		<div className="flex flex-col min-h-screen">
			<main className="max-w-full pt-6 pb-25 px-6">
				<Outlet context={userInfo} />
				<div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center gap-2">
					<FloatMenu userInfo={userInfo} />
					{isClient && userInfo && <BlockNoteDrawer />}
				</div>
			</main>
		</div>
	);
}
