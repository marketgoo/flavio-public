import { useState, useEffect } from 'react';
import Markdown from 'markdown-to-jsx';

/**
 * TypewriterText Component
 *
 * Animates text character by character with a typewriter effect.
 * Shows a blinking cursor while typing. Calls onComplete when finished.
 * Supports markdown formatting via markdown-to-jsx.
 *
 * @param {string} text - Text to animate (supports markdown: **bold**, *italic*, etc.)
 * @param {number} [speed=30] - Delay between characters in milliseconds
 * @param {string} [className=''] - Additional CSS classes for the text
 * @param {Function} [onComplete] - Callback when animation completes
 *
 * @example
 * <TypewriterText
 *   text="Hello, **how** can I help you?"
 *   speed={30}
 *   onComplete={() => setAnimationDone(true)}
 * />
 */
const TypewriterText = ({ text, speed = 30, className = '', onComplete }) => {
	const [displayedText, setDisplayedText] = useState('');
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		if (currentIndex < text.length) {
			const timeout = setTimeout(() => {
				setDisplayedText((prev) => prev + text[currentIndex]);
				setCurrentIndex((prev) => prev + 1);
			}, speed);

			return () => clearTimeout(timeout);
		} else if (currentIndex === text.length && onComplete) {
			onComplete();
		}
	}, [currentIndex, text, speed, onComplete]);

	const isTyping = currentIndex < text.length;
	const cursor = isTyping ? '|' : '';

	// Custom span component that behaves like a block for paragraphs
	// This prevents the style jump when Markdown switches from inline to block elements
	// Uses [&:not(:first-child)] to add margin-top only to subsequent paragraphs
	const BlockSpan = ({ children }) => (
		<span className="block [&:not(:first-child)]:mt-3">{children}</span>
	);

	return (
		<span className={className}>
			<Markdown
				options={{
					overrides: {
						p: { component: BlockSpan },
					},
				}}
			>
				{displayedText + cursor}
			</Markdown>
		</span>
	);
};

export default TypewriterText;
