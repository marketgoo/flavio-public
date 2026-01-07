import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * TextInput Component
 *
 * Basic text input with consistent styling.
 * Supports error state via `error` prop.
 */
const TextInput = forwardRef(
	({ className, type = 'text', error = false, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(
					'flex h-10 w-full !rounded-lg px-3 py-2',
					'placeholder:!text-neutral-300',
					'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
					'disabled:cursor-not-allowed disabled:opacity-50',
					'!shadow-2xs transition-colors',
					error
						? '!border-destructive focus-visible:ring-destructive'
						: '!border-input',
					className
				)}
				ref={ref}
				{...props}
			/>
		);
	}
);
TextInput.displayName = 'TextInput';

export { TextInput };
