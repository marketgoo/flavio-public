import { cn } from '@/lib/utils';

/**
 * Skeleton Component
 *
 * Animated placeholder for loading states.
 * Uses pulse animation and neutral background.
 *
 * @param {string} [className] - Additional CSS classes for sizing
 *
 * @example
 * <Skeleton className="h-4 w-32" />
 * <Skeleton className="h-12 w-full rounded-lg" />
 */
const Skeleton = ({ className, ...props }) => {
	return (
		<div
			className={cn(
				'animate-pulse rounded-md bg-neutral-200',
				className
			)}
			{...props}
		/>
	);
};

export { Skeleton };

