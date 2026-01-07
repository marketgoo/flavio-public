import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Textarea Component
 *
 * Multi-line text input with consistent styling.
 * Supports error state via `error` prop.
 */
const Textarea = forwardRef(({ className, error = false, ...props }, ref) => {
	return (
		<textarea
			className={cn(
				'flex min-h-[80px] w-full !rounded-lg !p-2',
				'placeholder:!text-neutral-300',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
				'disabled:cursor-not-allowed disabled:opacity-50',
				'!shadow-2xs transition-colors resize-y',
				error
					? '!border-destructive focus-visible:ring-destructive'
					: '!border-input',
				className
			)}
			ref={ref}
			{...props}
		/>
	);
});
Textarea.displayName = 'Textarea';

export { Textarea };
