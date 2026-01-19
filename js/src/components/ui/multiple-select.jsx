import { ChevronDown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

/**
 * MultipleSelect Component
 *
 * A multi-select component for categories or other items.
 * Invisible by default, shows selection and dropdown arrow on hover/focus.
 *
 * @param {string[]} value - Array of selected strings
 * @param {string[]} options - Array of available strings
 * @param {Function} onChange - Callback when selection changes
 * @param {string} [placeholder] - Placeholder text when nothing is selected
 * @param {string} [className] - Additional CSS classes
 * @param {boolean} [disabled] - Whether the input is disabled
 */
const MultipleSelect = ({
	value = [],
	options = [],
	onChange,
	placeholder = 'Select options...',
	className,
	disabled = false,
}) => {
	const handleToggle = (option) => {
		if (value.includes(option)) {
			onChange(value.filter((v) => v !== option));
		} else {
			onChange([...value, option]);
		}
	};

	const removeOption = (optionToRemove) => {
		onChange(value.filter((v) => v !== optionToRemove));
	};

	const isEmpty = value.length === 0;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<div
					role="button"
					tabIndex={0}
					className={cn(
						'group flex items-center justify-between gap-2 px-3 py-2 rounded-lg min-h-[42px] w-full cursor-pointer',
						'transition-all',
						isEmpty
							? 'border border-input bg-white shadow-2xs'
							: 'border border-transparent! shadow-none! bg-transparent! hover:border-input! hover:shadow-2xs! hover:bg-white! data-[state=open]:border-input! data-[state=open]:shadow-2xs! data-[state=open]:bg-white!',
						'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1',
						disabled &&
							'opacity-50 cursor-not-allowed pointer-events-none',
						className
					)}
				>
					<div className="flex flex-wrap items-center gap-2 flex-1">
						{value.length > 0 ? (
							value.map((item) => (
								<Badge
									key={item}
									className="bg-neutral-900 text-white gap-1 pr-1.5"
								>
									{item}
									<button
										type="button"
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											removeOption(item);
										}}
										onPointerDown={(e) => {
											e.stopPropagation();
										}}
										className="hover:bg-white/20 rounded-full p-0.5 transition-colors cursor-pointer"
										aria-label={`Remove ${item}`}
									>
										<X className="w-3 h-3" />
									</button>
								</Badge>
							))
						) : (
							<span className="text-sm text-neutral-400 group-data-[state=open]:text-neutral-300!">
								{placeholder}
							</span>
						)}
					</div>

					<ChevronDown
						className={cn(
							'w-4 h-4 shrink-0 transition-colors',
							isEmpty
								? 'text-neutral-400'
								: 'text-transparent! group-hover:text-neutral-400! group-focus:text-neutral-400! group-data-[state=open]:text-neutral-400!'
						)}
					/>
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
			>
				{options.map((option) => (
					<DropdownMenuCheckboxItem
						key={option}
						checked={value.includes(option)}
						onCheckedChange={() => handleToggle(option)}
						onSelect={(e) => e.preventDefault()} // Prevent closing on selection
					>
						{option}
					</DropdownMenuCheckboxItem>
				))}
				{options.length === 0 && (
					<div className="p-2 text-sm text-muted-foreground text-center">
						No options available
					</div>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export { MultipleSelect };
