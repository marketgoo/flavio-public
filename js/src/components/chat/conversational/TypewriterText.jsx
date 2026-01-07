import { useState, useEffect } from 'react';

/**
 * TypewriterText Component
 *
 * Animates text character by character with a typewriter effect.
 * Shows a blinking cursor while typing. Calls onComplete when finished.
 *
 * @param {string} text - Text to animate
 * @param {number} [speed=30] - Delay between characters in milliseconds
 * @param {string} [className=''] - Additional CSS classes for the text
 * @param {Function} [onComplete] - Callback when animation completes
 *
 * @example
 * <TypewriterText
 *   text="Hello, how can I help you?"
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

	return (
		<span className={className}>
			{displayedText}
			{currentIndex < text.length && (
				<span
					className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse"
					aria-hidden="true"
				/>
			)}
		</span>
	);
};

export default TypewriterText;

