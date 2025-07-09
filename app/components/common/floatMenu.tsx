import { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { UserInfo } from "~/types/user";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
	userInfo: UserInfo | null;
};

export default function FloatMenu({ userInfo }: Props) {
	const [open, setOpen] = useState(false);
	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger className="outline-none">
				<Button className="border-solid border-secondary border-1">
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
						<DropdownMenuItem>
							<Link to="/auth/logout">Logout</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
					</div>
				)}
				<DropdownMenuItem>
					<Link to="/" className="flex w-full">
						Top
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<Link to="/notes" className="flex w-full">
						Notes
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<Link to="/notes/images" className="flex w-full">
						Images
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<Link to="/wines" className="flex w-full">
						Wines
					</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
