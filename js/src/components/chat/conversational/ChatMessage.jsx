import { useState } from 'react';
import { CircleUserRound } from 'lucide-react';
import Markdown from 'markdown-to-jsx';
import { Button } from '@/components/ui/button';
import TypewriterText from './TypewriterText';
import { TIMINGS } from '@/config/timings';
import { getWordPressConfig } from '@/api/client';

/**
 * ChatMessage Component
 *
 * Displays a single message in the conversational chat interface.
 * Supports both user and assistant (Flavio) messages with typewriter effect
 * for assistant messages. Can include examples (shown in italic gray) and
 * action buttons for interactive messages.
 *
 * Uses Flavio mascot icon for assistant messages.
 * Supports basic markdown: **bold** and newlines.
 *
 * @param {('assistant'|'user')} [type='assistant'] - Message sender type
 * @param {string} content - Main message text (supports **bold** markdown)
 * @param {string} [example] - Optional example text (shown below main text in gray italic)
 * @param {Object} [action] - Optional action button configuration
 * @param {string} action.label - Button label
 * @param {Function} action.onClick - Button click handler
 * @param {boolean} [enableTypewriter=true] - Whether to show typewriter animation
 * @param {boolean} [isFirstInGroup=true] - Whether this is the first message in a group (shows icon)
 *
 * @example
 * <ChatMessage
 *   type="assistant"
 *   content="What is your business name?"
 *   example='"Example: Acme Corp"'
 *   enableTypewriter={true}
 *   isFirstInGroup={true}
 * />
 */
const ChatMessage = ({
	type = 'assistant',
	content,
	example,
	action,
	enableTypewriter = true,
	isFirstInGroup = true,
}) => {
	const isAssistant = type === 'assistant';
	const [questionComplete, setQuestionComplete] = useState(!enableTypewriter);
	const [textComplete, setTextComplete] = useState(!enableTypewriter);
	const config = getWordPressConfig();

	if (isAssistant) {
		return (
			<div className="max-w-[85%] min-w-[85%] bg-primary-foreground rounded-sm px-4 py-2">
				{/* Message with Flavio icon */}
				<div className="flex items-start gap-3">
					{/* Flavio mascot icon - only show on first message of group */}
					{isFirstInGroup ? (
						<img
							src={`${config?.pluginUrl || ''}js/public/onboarding.svg`}
							alt="Flavio"
							className="size-6 shrink-0 mt-3.5"
							aria-hidden="true"
						/>
					) : (
						<div className="size-6 shrink-0" aria-hidden="true" />
					)}

					{/* Message content */}
					<div className="flex-1">
						{/* If there's an example, content is a question (bold) */}
						{example ? (
							<>
								<p className="small-semibold leading-relaxed">
									{enableTypewriter ? (
										<TypewriterText
											text={content}
											speed={
												TIMINGS.ANIMATION
													.TYPEWRITER_CHAR
											}
											onComplete={() =>
												setQuestionComplete(true)
											}
										/>
									) : (
										content
									)}
								</p>
								{questionComplete && (
									<p className="small-regular text-muted-foreground leading-relaxed">
										{enableTypewriter ? (
											<TypewriterText
												text={example}
												speed={
													TIMINGS.ANIMATION
														.TYPEWRITER_EXAMPLE
												}
											/>
										) : (
											example
										)}
									</p>
								)}
							</>
						) : (
							<>
								<div className="small-regular leading-relaxed">
									{enableTypewriter ? (
										<TypewriterText
											text={content}
											speed={
												TIMINGS.ANIMATION
													.TYPEWRITER_CHAR
											}
											onComplete={() =>
												setTextComplete(true)
											}
										/>
									) : (
										<Markdown>{content}</Markdown>
									)}
								</div>
								{action && textComplete && (
									<div className="mt-3">
										<Button
											onClick={action.onClick}
											size="sm"
											className="w-full"
										>
											{action.label}
										</Button>
									</div>
								)}
							</>
						)}
					</div>
				</div>
			</div>
		);
	}

	// User message
	return (
		<div className="max-w-[85%] ml-auto">
			{/* Message bubble with user icon */}
			<div className="flex items-start gap-2 border rounded-sm px-4 py-1">
				<p className="small-regular leading-relaxed flex-1">
					{content}
				</p>
				<CircleUserRound
					className="size-6 shrink-0 text-lime-500 mt-3"
					aria-hidden="true"
				/>
			</div>
		</div>
	);
};

export default ChatMessage;
