import { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * TagInput Component
 *
 * Input that allows adding/removing tags (chips).
 * Tags are created on Enter or Space key.
 * Tags are removed by pressing Backspace on empty input.
 * Border is transparent by default, visible on hover/focus.
 *
 * @param {string[]} value - Array of tag strings
 * @param {Function} onChange - Callback when tags change (receives new array)
 * @param {string} [placeholder] - Input placeholder
 * @param {string} [className] - Additional CSS classes for container
 * @param {boolean} [disabled] - Whether the input is disabled
 */
const TagInput = ({
	value = [],
	onChange,
	placeholder = 'Type and press Enter...',
	className,
	disabled = false,
}) => {
	const [inputValue, setInputValue] = useState('');
	const [isMarkedForDeletion, setIsMarkedForDeletion] = useState(false);

	const addTag = useCallback(
		(tag) => {
			const trimmedTag = tag.trim();
			if (trimmedTag && !value.includes(trimmedTag)) {
				onChange([...value, trimmedTag]);
			}
			setInputValue('');
			setIsMarkedForDeletion(false);
		},
		[value, onChange]
	);

	const removeLastTag = useCallback(() => {
		if (value.length > 0) {
			onChange(value.slice(0, -1));
			setIsMarkedForDeletion(false);
		}
	}, [value, onChange]);

	const removeTag = useCallback(
		(tagToRemove) => {
			onChange(value.filter((tag) => tag !== tagToRemove));
			setIsMarkedForDeletion(false);
		},
		[value, onChange]
	);

	const handleKeyDown = (e) => {
		if (disabled) return;

		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			if (inputValue.trim()) {
				addTag(inputValue);
			}
		} else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
			if (isMarkedForDeletion) {
				// Second backspace: remove the tag
				removeLastTag();
			} else {
				// First backspace: mark for deletion
				setIsMarkedForDeletion(true);
			}
		} else {
			// Any other key clears the marking
			setIsMarkedForDeletion(false);
		}
	};

	const handleChange = (e) => {
		setInputValue(e.target.value);
		if (isMarkedForDeletion) setIsMarkedForDeletion(false);
	};

	const handleBlur = () => {
		// Add tag on blur if there's text
		if (inputValue.trim()) {
			addTag(inputValue);
		}
		setIsMarkedForDeletion(false);
	};

	const isEmpty = value.length === 0;

	return (
		<div
			className={cn(
				'group flex flex-wrap items-center gap-2 px-3 py-1 rounded-lg min-h-[42px] transition-all',
				isEmpty
					? 'border border-input bg-white shadow-2xs'
					: 'border border-transparent! shadow-none! bg-transparent! hover:border-input! hover:shadow-2xs! hover:bg-white! focus-within:bg-white! focus-within:border-input! focus-within:shadow-2xs!',
				'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1',
				disabled && 'opacity-50 cursor-not-allowed',
				className
			)}
		>
			{value.map((tag, index) => {
				const isLast = index === value.length - 1;
				const isMarked = isLast && isMarkedForDeletion;

				return (
					<Badge
						key={tag}
						className={cn(
							'bg-neutral-900 text-white transition-colors gap-1 pr-1.5',
							isMarked && 'bg-destructive'
						)}
					>
						{tag}
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								removeTag(tag);
							}}
							className="hover:bg-white/20 rounded-full p-0.5 transition-colors cursor-pointer"
							aria-label={`Remove ${tag}`}
						>
							<X className="w-3 h-3" />
						</button>
					</Badge>
				);
			})}
			<input
				type="text"
				value={inputValue}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				onBlur={handleBlur}
				placeholder={placeholder}
				disabled={disabled}
				className={cn(
					'flex-1 min-w-[80px] bg-transparent outline-none text-sm border-none! shadow-none!',
					isEmpty
						? 'placeholder:text-neutral-400'
						: 'placeholder:text-transparent! group-hover:placeholder:text-neutral-300! group-focus-within:placeholder:text-neutral-300!',
					disabled && 'cursor-not-allowed'
				)}
			/>
		</div>
	);
};

export { TagInput };
