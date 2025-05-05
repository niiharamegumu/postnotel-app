import { useOutletContext } from "react-router";
import type { UserInfo } from "~/types/user";

export function meta() {
	return [{ title: "PostNotel" }, { name: "description", content: "PostNotel Top" }];
}

export default function Top() {
	const userInfo = useOutletContext<UserInfo>();
	return (
		<section>
			<h1>PostNotel</h1>
			{userInfo?.name && (
				<div className="text-xl mb-4">
					<p>name：{userInfo.name}</p>
					<p>email：{userInfo.email}</p>
					<img
						src={userInfo.avatarUrl}
						alt="User Profile"
						className="rounded-full w-[50px] h-[50px] object-cover"
						loading="lazy"
						decoding="async"
					/>
				</div>
			)}
		</section>
	);
}
