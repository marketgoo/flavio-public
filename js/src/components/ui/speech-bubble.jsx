import { cn } from '@/lib/utils';

/**
 * SpeechBubble Component
 *
 * A speech bubble with an arrow pointing in a specified direction.
 * Used for tooltips, callouts, and informational messages.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content inside the bubble
 * @param {'left' | 'right' | 'top' | 'bottom'} [props.arrow='left'] - Direction the arrow points
 * @param {string} [props.className] - Additional classes for the bubble
 */
const SpeechBubble = ({ children, arrow = 'left', className }) => {
	// Arrow position styles based on direction
	const arrowStyles = {
		left: 'left-0.5 top-1/2 -translate-x-full -translate-y-1/2 border-r-neutral-900',
		right: 'right-0.5 top-1/2 translate-x-full -translate-y-1/2 border-l-neutral-900',
		top: 'top-0.5 left-1/2 -translate-y-full -translate-x-1/2 border-b-neutral-900',
		bottom: 'bottom-0.5 left-1/2 translate-y-full -translate-x-1/2 border-t-neutral-900',
	};

	return (
		<div
			className={cn(
				'relative bg-neutral-900 text-white px-3 py-2 text-sm rounded-xl',
				className
			)}
		>
			{/* Arrow */}
			<div
				className={cn(
					'absolute border-8 border-transparent',
					arrowStyles[arrow]
				)}
				aria-hidden="true"
			/>
			{children}
		</div>
	);
};

export default SpeechBubble;
