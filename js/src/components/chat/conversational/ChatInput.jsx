import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

/**
 * ChatInput Component
 *
 * Text input for free-form responses in conversational chat.
 * Supports Enter key to send (without Shift for new line).
 * Auto-focuses when enabled.
 *
 * @param {string} value - Current input value
 * @param {Function} onChange - Callback when input changes, receives new value string
 * @param {Function} onSend - Callback when user sends message (Enter key or button click)
 * @param {string} [placeholder='Write something...'] - Input placeholder text
 * @param {boolean} [disabled=false] - Whether input is disabled
 *
 * @example
 * <ChatInput
 *   value={inputText}
 *   onChange={setInputText}
 *   onSend={handleSend}
 *   placeholder="Type your answer..."
 * />
 */
const ChatInput = ({
	value,
	onChange,
	onSend,
	placeholder = 'Write something...',
	disabled = false,
}) => {
	const inputRef = useRef(null);

	// Auto-focus when component appears
	useEffect(() => {
		if (!disabled && inputRef.current) {
			inputRef.current.focus();
		}
	}, [disabled]);

	const handleKeyPress = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			onSend();
		}
	};

	return (
		<div className="flex items-center gap-2 px-2 py-2 bg-card border border-border rounded-sm">
			<input
				ref={inputRef}
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyPress={handleKeyPress}
				placeholder={placeholder}
				className="flex-1 bg-transparent !border-none !outline-none !text-sm !placeholder:text-muted-foreground"
				disabled={disabled}
			/>
			<Button
				onClick={onSend}
				disabled={!value.trim() || disabled}
				variant="secondary"
				size="sm"
			>
				Send
			</Button>
		</div>
	);
};

export default ChatInput;
