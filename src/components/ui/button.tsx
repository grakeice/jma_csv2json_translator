import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
	size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = "default", size = "default", ...props }, ref) => {
		const variants = {
			default:
				"bg-blue-100 text-blue-700 shadow-lg shadow-gray-300/40 hover:shadow-lg hover:shadow-gray-300/50 active:shadow-inner active:shadow-gray-300",
			destructive:
				"bg-red-100 text-red-700 shadow-lg shadow-gray-300/40 hover:shadow-lg hover:shadow-gray-300/50 active:shadow-inner active:shadow-gray-300",
			outline:
				"bg-gray-100 text-gray-700 shadow-inner shadow-gray-200 hover:shadow-inner hover:shadow-gray-300 active:shadow-inner active:shadow-gray-400",
			secondary:
				"bg-green-100 text-green-700 shadow-lg shadow-gray-300/40 hover:shadow-lg hover:shadow-gray-300/50",
			ghost: "text-gray-700 hover:bg-gray-100/50 hover:shadow-inner hover:shadow-gray-200",
			link: "text-blue-600 underline-offset-4 hover:underline",
		};
		const sizes = {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-lg px-3 text-xs",
			lg: "h-10 rounded-xl px-8",
			icon: "h-9 w-9",
		};

		return (
			<button
				className={cn(
					"inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:shadow-inner focus-visible:shadow-gray-300 disabled:pointer-events-none disabled:opacity-50",
					variants[variant],
					sizes[size],
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export { Button };
