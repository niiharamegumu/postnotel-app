import { cn } from "~/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
	className?: string;
	variant?: "skeleton" | "spinner" | "dots" | "pulse";
	size?: "sm" | "md" | "lg" | "xl";
	color?: "primary" | "secondary" | "accent";
}

export const LoadingState = ({
	className,
	variant = "skeleton",
	size = "md",
	color = "primary",
}: LoadingStateProps) => {
	const sizeClasses = {
		sm: "h-4 w-4",
		md: "h-6 w-6",
		lg: "h-8 w-8",
		xl: "h-12 w-12",
	};

	const colorClasses = {
		primary: "text-primary",
		secondary: "text-secondary",
		accent: "text-accent",
	};

	if (variant === "spinner") {
		return (
			<div className={cn("flex items-center justify-center", className)}>
				<Loader2 className={cn("animate-spin", sizeClasses[size], colorClasses[color])} />
			</div>
		);
	}

	if (variant === "dots") {
		return (
			<div className={cn("flex items-center justify-center space-x-1", className)}>
				<div
					className={cn(
						"rounded-full bg-current animate-pulse",
						size === "sm"
							? "h-1 w-1"
							: size === "md"
								? "h-2 w-2"
								: size === "lg"
									? "h-3 w-3"
									: "h-4 w-4",
						colorClasses[color],
					)}
					style={{ animationDelay: "0ms" }}
				/>
				<div
					className={cn(
						"rounded-full bg-current animate-pulse",
						size === "sm"
							? "h-1 w-1"
							: size === "md"
								? "h-2 w-2"
								: size === "lg"
									? "h-3 w-3"
									: "h-4 w-4",
						colorClasses[color],
					)}
					style={{ animationDelay: "150ms" }}
				/>
				<div
					className={cn(
						"rounded-full bg-current animate-pulse",
						size === "sm"
							? "h-1 w-1"
							: size === "md"
								? "h-2 w-2"
								: size === "lg"
									? "h-3 w-3"
									: "h-4 w-4",
						colorClasses[color],
					)}
					style={{ animationDelay: "300ms" }}
				/>
			</div>
		);
	}

	if (variant === "pulse") {
		return (
			<div className={cn("flex items-center justify-center", className)}>
				<div
					className={cn(
						"rounded-full bg-current animate-pulse",
						sizeClasses[size],
						colorClasses[color],
					)}
				/>
			</div>
		);
	}

	// Default skeleton variant
	return <div className={cn("bg-accent animate-pulse rounded-md", className)} />;
};
