import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Form, Link } from "react-router";
import { useNavigation } from "~/hooks/useNavigation";
import type { UserInfo } from "~/types/user";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { LoadingState } from "./LoadingState";

type Props = {
	userInfo: UserInfo | null;
};

export default function FloatMenu({ userInfo }: Props) {
	const [open, setOpen] = useState(false);
	const { isLoading } = useNavigation();

	const handleOpenChange = (isOpen: boolean): void => {
		if (isLoading) return;
		setOpen(isOpen);
	};

	return (
		<DropdownMenu open={open} onOpenChange={handleOpenChange}>
			<DropdownMenuTrigger asChild className="outline-none">
				<Button className="border-solid border-secondary border-1" disabled={isLoading}>
					{isLoading ? (
						<LoadingState variant="spinner" size="sm" />
					) : (
						<AnimatePresence mode="wait" initial={false}>
							<motion.span
								key={open ? "close" : "menu"}
								initial={{ opacity: 0, scale: 0.7 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.7 }}
								transition={{ duration: 0.18, ease: "easeInOut" }}
							>
								{open ? <X /> : <Menu />}
							</motion.span>
						</AnimatePresence>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				{userInfo && (
					<div>
						<DropdownMenuLabel className="flex items-center gap-2">
							<Avatar className="size-8">
								<AvatarImage src={userInfo.avatarUrl} alt="User Avatar" />
							</Avatar>
							{userInfo.name}
						</DropdownMenuLabel>
						<DropdownMenuItem asChild>
							<Form action="/api/auth/logout" method="post" className="w-full">
								<button type="submit" className="w-full text-left">
									Logout
								</button>
							</Form>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
					</div>
				)}
				<DropdownMenuItem asChild>
					<Link to="/" className="flex w-full">
						Top
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link to="/notes" className="flex w-full">
						Notes
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link to="/notes/search" className="flex w-full">
						Search
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link to="/notes/images" className="flex w-full">
						Images
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link to="/wines" className="flex w-full">
						Wines
					</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
