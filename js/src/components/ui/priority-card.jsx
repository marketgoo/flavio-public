import { cn } from '@/lib/utils';

/**
 * PriorityCard Component
 *
 * Selectable card for priority/goal selection in onboarding
 */
const PriorityCard = ({
	icon,
	title,
	description,
	selected = false,
	disabled = false,
	onClick,
	className,
}) => {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={cn(
				'relative px-3 pt-10 rounded-lg border text-left transition-all flex flex-col items-start',
				'hover:border-primary/50 hover:shadow-md',
				'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
				'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:shadow-none',
				className
			)}
			aria-pressed={selected}
		>
			{/* Selection indicator - radio style */}
			<div
				className={cn(
					'absolute top-4 right-4 size-5 rounded-full border transition-all flex items-center justify-center',
					selected ? 'border-neutral-900' : 'border-neutral-300'
				)}
				aria-hidden="true"
			>
				{selected && (
					<div className="size-2.5 rounded-full bg-neutral-900" />
				)}
			</div>

			{/* Icon */}
			<div className="mb-4" aria-hidden="true">
				{icon}
			</div>

			{/* Title */}
			<h4 className="heading-h4 mb-2 pr-8">{title}</h4>

			{/* Description */}
			<p className="!text-xs text-muted-foreground">{description}</p>
		</button>
	);
};

export default PriorityCard;
