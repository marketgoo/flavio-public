import { useRef, useEffect, useCallback, forwardRef } from 'react';
import { Textarea } from '@/components/ui/textarea';

/**
 * AutoResizeTextarea Component
 *
 * A textarea that automatically expands to fit its content.
 * No vertical scrollbar - height adjusts dynamically.
 *
 * @param {string} value - The textarea value
 * @param {Function} onChange - Change handler
 * @param {string} [className] - Additional CSS classes
 * @param {number} [minRows=2] - Minimum number of rows
 */
const AutoResizeTextarea = forwardRef(
	({ value, onChange, className, minRows = 2, ...props }, ref) => {
		const internalRef = useRef(null);

		const adjustHeight = useCallback(() => {
			const textarea = internalRef.current;
			if (textarea) {
				textarea.style.height = 'auto';
				textarea.style.height = `${textarea.scrollHeight}px`;
			}
		}, []);

		useEffect(() => {
			adjustHeight();
		}, [value, adjustHeight]);

		const handleChange = (e) => {
			onChange?.(e);
			adjustHeight();
		};

		// Sync internal ref with forwarded ref
		const setRefs = useCallback(
			(node) => {
				internalRef.current = node;
				if (typeof ref === 'function') {
					ref(node);
				} else if (ref) {
					ref.current = node;
				}
			},
			[ref]
		);

		return (
			<Textarea
				ref={setRefs}
				value={value}
				onChange={handleChange}
				rows={minRows}
				className={`overflow-hidden! resize-none! ${className || ''}`}
				{...props}
			/>
		);
	}
);

AutoResizeTextarea.displayName = 'AutoResizeTextarea';

export { AutoResizeTextarea };
