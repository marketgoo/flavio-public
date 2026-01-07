import { Button } from '@/components/ui/button';

/**
 * ChatOptions Component
 *
 * Displays predefined button options for multiple choice questions in chat.
 * Each option is a full-width button with left-aligned text.
 *
 * @param {Array<Object>} options - Array of option objects
 * @param {string} options[].id - Unique option identifier
 * @param {string} options[].label - Option text to display
 * @param {Function} onSelect - Callback when option is clicked, receives option.id
 * @param {boolean} [disabled=false] - Whether all options are disabled
 *
 * @example
 * <ChatOptions
 *   options={[
 *     { id: 'opt1', label: 'Yes, I agree' },
 *     { id: 'opt2', label: 'No, thanks' }
 *   ]}
 *   onSelect={(id) => handleSelection(id)}
 *   disabled={false}
 * />
 */
const ChatOptions = ({ options, onSelect, disabled = false }) => {
	return (
		<div className="flex flex-col gap-2">
			{options.map((option) => (
				<Button
					key={option.id}
					onClick={() => onSelect(option.id)}
					disabled={disabled}
					variant="outline"
					size="lg"
					className="justify-start text-left h-auto py-3 px-4 whitespace-normal"
				>
					{option.label}
				</Button>
			))}
		</div>
	);
};

export default ChatOptions;

