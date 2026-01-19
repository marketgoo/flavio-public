import { useState, useEffect, useRef } from 'react';
import ChatMessage from '@/components/chat/conversational/ChatMessage';
import ChatInput from '@/components/chat/conversational/ChatInput';
import ChatOptions from '@/components/chat/conversational/ChatOptions';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { TIMINGS } from '@/config/timings';

/**
 * ConversationalChat Component
 *
 * Reusable conversational chat interface with configurable questions.
 * Supports both text input and predefined options, with typewriter effect
 * for assistant messages and localStorage state restoration.
 *
 * @param {Array} questions - Array of question objects { id, type, question, field, options, acknowledgment }
 * @param {Function} onComplete - Callback when all questions are answered, receives responses object
 * @param {Object} [initialValues={}] - Pre-filled values to restore chat state from localStorage
 * @param {string} [completionMessage='Done! Processing your responses...'] - Final message before completing
 * @param {number} [responseDelay=TIMINGS.CHAT.RESPONSE_DELAY] - Delay before showing acknowledgment (ms)
 * @param {number} [questionDelay=TIMINGS.CHAT.QUESTION_DELAY] - Delay before showing next question (ms)
 * @param {string} [optionsVariant='default'] - Visual variant for options: 'default' | 'chips'
 * @param {boolean} [showInputWithOptions=false] - Show text input alongside options (for hybrid input)
 * @param {string} [inputPlaceholder='Write something...'] - Placeholder for the text input when shown with options
 *
 * @example
 * <ConversationalChat
 *   questions={[
 *     { id: 'name', type: 'text', question: 'What is your name?', field: 'userName' },
 *     { id: 'age', type: 'options', question: 'Your age?', field: 'userAge', options: [...] }
 *   ]}
 *   onComplete={(responses) => saveData(responses)}
 *   initialValues={{ userName: 'John' }}
 *   optionsVariant="chips"
 *   showInputWithOptions={true}
 * />
 */
const ConversationalChat = ({
	questions = [],
	onComplete,
	initialValues = {},
	completionMessage = 'Done! Processing your responses...',
	responseDelay = TIMINGS.CHAT.RESPONSE_DELAY,
	questionDelay = TIMINGS.CHAT.QUESTION_DELAY,
	optionsVariant = 'default',
	showInputWithOptions = false,
	inputPlaceholder = 'Write something...',
}) => {
	// Lazy initialization: Calculate initial state once without effects
	const [initialState] = useState(() => {
		// Check if initialValues has any real values (not null/undefined)
		const hasRealValues = Object.values(initialValues).some(
			(val) => val != null && val !== ''
		);

		if (!hasRealValues || questions.length === 0) {
			// No real values - start with first question
			return {
				messages:
					questions.length > 0
						? [
								{
									type: 'assistant',
									content: questions[0].question,
									example: questions[0].example,
								},
							]
						: [],
				currentQuestion: 0,
				needsDelayedMessage: false,
				lastAnsweredIndex: -1,
			};
		}

		// Has real values - restore chat history
		const { restoredMessages, lastAnsweredIndex } = questions.reduce(
			(acc, question, index) => {
				const fieldValue = initialValues[question.field];

				if (fieldValue) {
					// Add question
					acc.restoredMessages.push({
						type: 'assistant',
						content: question.question,
						example: question.example,
					});

					// Add user response
					acc.restoredMessages.push({
						type: 'user',
						content: fieldValue,
					});

					// Add acknowledgment if exists
					if (question.acknowledgment) {
						acc.restoredMessages.push({
							type: 'assistant',
							content: question.acknowledgment,
						});
					}

					// Update last answered index
					acc.lastAnsweredIndex = index;
				}

				return acc;
			},
			{ restoredMessages: [], lastAnsweredIndex: -1 }
		);

		const allAnswered = lastAnsweredIndex + 1 >= questions.length;

		return {
			messages: restoredMessages,
			currentQuestion: lastAnsweredIndex + 1,
			needsDelayedMessage: restoredMessages.length > 0,
			allAnswered,
			lastAnsweredIndex,
		};
	});

	const [messages, setMessages] = useState(initialState.messages);
	const [currentInput, setCurrentInput] = useState('');
	const [currentQuestion, setCurrentQuestion] = useState(
		initialState.currentQuestion
	);
	const [isProcessing, setIsProcessing] = useState(false);
	const [responses, setResponses] = useState(initialValues);
	const hasAddedContinueMessage = useRef(false);

	// Auto-scroll to bottom when messages change
	const messagesEndRef = useAutoScroll([messages], {
		behavior: 'smooth',
		block: 'nearest',
	});

	// Effect ONLY for delayed messages after restoration (async operation)
	useEffect(() => {
		if (!initialState.needsDelayedMessage) return;

		if (!initialState.allAnswered) {
			// Add next unanswered question after a short delay
			const timer = setTimeout(() => {
				setMessages((prev) => [
					...prev,
					{
						type: 'assistant',
						content:
							questions[initialState.lastAnsweredIndex + 1]
								.question,
						example:
							questions[initialState.lastAnsweredIndex + 1]
								.example,
					},
				]);
			}, TIMINGS.CHAT.BUFFER);

			return () => clearTimeout(timer);
		} else {
			// All questions answered - add completion message with action button
			if (!hasAddedContinueMessage.current) {
				hasAddedContinueMessage.current = true;
				const timer = setTimeout(() => {
					setMessages((prev) => [
						...prev,
						{
							type: 'assistant',
							content:
								'I have all your information saved. Ready to continue?',
							action: {
								label: 'Continue',
								onClick: () => onComplete?.(responses),
							},
						},
					]);
				}, TIMINGS.CHAT.BUFFER);

				return () => clearTimeout(timer);
			}
		}
	}, []); // Empty deps - runs once on mount

	// Calculate how long typewriter takes for a message
	const calculateTypingTime = (content, example) => {
		const contentTime = content
			? content.length * TIMINGS.ANIMATION.TYPEWRITER_CHAR
			: 0;
		const exampleTime = example
			? example.length * TIMINGS.ANIMATION.TYPEWRITER_EXAMPLE
			: 0;
		return contentTime + exampleTime + TIMINGS.CHAT.BUFFER;
	};

	const handleResponse = (responseValue) => {
		if (isProcessing) return;

		const questionData = questions[currentQuestion];

		// Add user message
		setMessages((prev) => [
			...prev,
			{
				type: 'user',
				content: responseValue,
			},
		]);

		// Save response
		const newResponses = {
			...responses,
			[questionData.field]: responseValue,
		};
		setResponses(newResponses);

		setCurrentInput('');
		setIsProcessing(true);

		// First delay: Show acknowledgment message if provided
		setTimeout(() => {
			if (currentQuestion < questions.length - 1) {
				// Show acknowledgment if provided
				if (questionData.acknowledgment) {
					setMessages((prev) => [
						...prev,
						{
							type: 'assistant',
							content: questionData.acknowledgment,
						},
					]);

					// Calculate typing time for acknowledgment
					const ackTypingTime = calculateTypingTime(
						questionData.acknowledgment
					);

					// Wait for acknowledgment to finish typing, then show next question
					setTimeout(() => {
						const nextQuestion = questions[currentQuestion + 1];
						setMessages((prev) => [
							...prev,
							{
								type: 'assistant',
								content: nextQuestion.question,
								example: nextQuestion.example,
							},
						]);
						setCurrentQuestion(currentQuestion + 1);
						setIsProcessing(false);
					}, ackTypingTime + questionDelay);
				} else {
					// No acknowledgment, go directly to next question
					const nextQuestion = questions[currentQuestion + 1];
					setMessages((prev) => [
						...prev,
						{
							type: 'assistant',
							content: nextQuestion.question,
							example: nextQuestion.example,
						},
					]);
					setCurrentQuestion(currentQuestion + 1);
					setIsProcessing(false);
				}
			} else {
				// All questions answered - show acknowledgment if provided, then completion message
				if (questionData.acknowledgment) {
					setMessages((prev) => [
						...prev,
						{
							type: 'assistant',
							content: questionData.acknowledgment,
						},
					]);

					const ackTypingTime = calculateTypingTime(
						questionData.acknowledgment
					);

					setTimeout(() => {
						setMessages((prev) => [
							...prev,
							{
								type: 'assistant',
								content: completionMessage,
							},
						]);

						const completionTypingTime =
							calculateTypingTime(completionMessage);

						setTimeout(() => {
							onComplete?.(newResponses);
						}, completionTypingTime + TIMINGS.API.MARK_DONE_DELAY);
					}, ackTypingTime + questionDelay);
				} else {
					setMessages((prev) => [
						...prev,
						{
							type: 'assistant',
							content: completionMessage,
						},
					]);

					const completionTypingTime =
						calculateTypingTime(completionMessage);

					setTimeout(() => {
						onComplete?.(newResponses);
					}, completionTypingTime + TIMINGS.API.MARK_DONE_DELAY);
				}
			}
		}, responseDelay);
	};

	const handleTextSend = () => {
		if (!currentInput.trim() || isProcessing) return;
		handleResponse(currentInput.trim());
	};

	const handleOptionSelect = (option) => {
		if (isProcessing) return;
		handleResponse(option.label);
	};

	const currentQuestionData = questions[currentQuestion];
	const isTextInput = currentQuestionData?.type === 'text';
	const isOptions = currentQuestionData?.type === 'options';

	return (
		<div className="bg-card border border-border rounded-sm overflow-hidden flex flex-col">
			{/* Chat messages container */}
			<div className="flex-1 p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
				<div className="space-y-0">
					{messages.map((message, index) => {
						// Only enable typewriter for the last assistant message
						const isLastMessage = index === messages.length - 1;
						const enableTypewriter =
							isLastMessage && message.type === 'assistant';

						// Check if this message is the first in a group (different sender than previous)
						const isFirstInGroup =
							index === 0 ||
							messages[index - 1].type !== message.type;
						// Check if this message is the last in a group (different sender than next)
						const isLastInGroup =
							index === messages.length - 1 ||
							messages[index + 1].type !== message.type;

						// Show chips after the last assistant message when using chips variant
						const showChipsAfterMessage =
							isLastMessage &&
							message.type === 'assistant' &&
							optionsVariant === 'chips' &&
							isOptions &&
							!isProcessing;

						return (
							<div key={index}>
								<div
									className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} ${
										isLastInGroup && !showChipsAfterMessage
											? 'mb-3'
											: 'mb-1'
									}`}
								>
									<ChatMessage
										type={message.type}
										content={message.content}
										example={message.example}
										action={message.action}
										enableTypewriter={enableTypewriter}
										isFirstInGroup={isFirstInGroup}
									/>
								</div>
								{showChipsAfterMessage && (
									<div className="mt-3 mb-3 ml-12">
										<ChatOptions
											options={
												currentQuestionData.options
											}
											onSelect={handleOptionSelect}
											disabled={isProcessing}
											variant="chips"
										/>
									</div>
								)}
							</div>
						);
					})}
					<div ref={messagesEndRef} className="h-20" />
				</div>
			</div>

			{/* Input area - inside chat container */}
			<div className="p-4 space-y-4">
				{isTextInput && (
					<ChatInput
						value={currentInput}
						onChange={setCurrentInput}
						onSend={handleTextSend}
						placeholder={currentQuestionData.placeholder}
						disabled={isProcessing}
					/>
				)}

				{isOptions && optionsVariant !== 'chips' && (
					<ChatOptions
						options={currentQuestionData.options}
						onSelect={handleOptionSelect}
						disabled={isProcessing}
						variant={optionsVariant}
					/>
				)}

				{/* For chips variant or showInputWithOptions, always show input */}
				{isOptions &&
					(optionsVariant === 'chips' || showInputWithOptions) && (
						<ChatInput
							value={currentInput}
							onChange={setCurrentInput}
							onSend={handleTextSend}
							placeholder={inputPlaceholder}
							disabled={isProcessing}
						/>
					)}
			</div>
		</div>
	);
};

export default ConversationalChat;
