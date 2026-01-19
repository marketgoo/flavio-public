import { cn } from '@/lib/utils';

/**
 * ChatOptions Component
 *
 * Displays predefined button options for multiple choice questions in chat.
 * Supports multiple visual variants for different use cases.
 *
 * @param {Array<Object>} options - Array of option objects
 * @param {string} options[].id - Unique option identifier
 * @param {string} options[].label - Option text to display
 * @param {Function} onSelect - Callback when option is clicked, receives option object
 * @param {boolean} [disabled=false] - Whether all options are disabled
 * @param {string} [variant='default'] - Visual variant: 'default' | 'chips'
 *
 * @example
 * // Default variant (button style)
 * <ChatOptions
 *   options={[{ id: 'opt1', label: 'Yes, I agree' }]}
 *   onSelect={(option) => handleSelection(option)}
 * />
 *
 * @example
 * // Chips variant (small inline badges)
 * <ChatOptions
 *   variant="chips"
 *   options={[{ id: 'opt1', label: 'Topic A' }]}
 *   onSelect={(option) => handleSelection(option)}
 * />
 */
const ChatOptions = ({
	options,
	onSelect,
	disabled = false,
	variant = 'default',
}) => {
	// Chips variant - small inline badges (Figma specs)
	if (variant === 'chips') {
		return (
			<div className="flex flex-wrap gap-1.5">
				{options.map((option) => (
					<button
						key={option.id || option.value || option.label}
						type="button"
						onClick={() => onSelect(option)}
						disabled={disabled}
						className={cn(
							'inline-flex items-center min-h-6 px-2 py-[3px] rounded-full',
							'border border-neutral-200 bg-white',
							'shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]',
							'hover:bg-magenta-50 hover:border-neutral-300 transition-all',
							'text-xs text-magenta-500',
							'disabled:opacity-50 disabled:cursor-not-allowed',
							'cursor-pointer'
						)}
					>
						{option.label}
					</button>
				))}
			</div>
		);
	}

	// Default variant - button style
	return (
		<div className="flex flex-col gap-2">
			{options.map((option) => (
				<button
					key={option.id || option.value || option.label}
					type="button"
					onClick={() => onSelect(option)}
					disabled={disabled}
					className={cn(
						'w-full text-left py-3 px-4 rounded-lg border border-neutral-200',
						'bg-white hover:bg-neutral-50 transition-colors',
						'paragraph-regular text-neutral-800',
						'disabled:opacity-50 disabled:cursor-not-allowed'
					)}
				>
					{option.label}
				</button>
			))}
		</div>
	);
};

export default ChatOptions;
