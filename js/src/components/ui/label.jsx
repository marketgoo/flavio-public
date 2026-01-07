import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Label Component
 *
 * Form label with consistent styling.
 */
const Label = forwardRef(({ className, ...props }, ref) => (
	<label
		ref={ref}
		className={cn('small-bold text-foreground', className)}
		{...props}
	/>
));
Label.displayName = 'Label';

export { Label };
