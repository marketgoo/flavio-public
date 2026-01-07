import Markdown from 'markdown-to-jsx';
import { CircleUserRound } from 'lucide-react';
import { getWordPressConfig } from '@/api/client';

/**
 * GuidedChatMessageGroup Component
 *
 * Renders a group of consecutive messages from the same sender.
 * Messages share a single background container with proper border radius.
 *
 * @param {('assistant'|'user')} [type='assistant'] - Message sender type
 * @param {Array<{content: string, options?: Array}>} messages - Array of message objects in this group
 *
 * @example
 * <GuidedChatMessageGroup
 *   type="assistant"
 *   messages={[
 *     { content: "Hello!" },
 *     { content: "How can I help?" }
 *   ]}
 * />
 */
export const GuidedChatMessageGroup = ({ type = 'assistant', messages }) => {
	const isAssistant = type === 'assistant';
	const config = getWordPressConfig();

	if (isAssistant) {
		return (
			<div className="max-w-[90%]">
				<div className="bg-primary-foreground rounded-lg px-4 py-3 flex items-start gap-3">
					{/* Flavio icon */}
					<img
						src={`${config?.pluginUrl || ''}js/public/onboarding.svg`}
						alt=""
						className="w-5 h-5 shrink-0 mt-0.5"
						aria-hidden="true"
					/>

					{/* Messages content */}
					<div className="min-w-0 flex-1">
						{messages.map((message, index) => (
							<div key={index} className="mb-3 last:mb-0">
								{message.codeBlock ? (
									<>
										{message.content && (
											<Markdown
												className="small-regular leading-relaxed mb-3"
												options={{
													overrides: {
														p: {
															props: {
																className:
																	'mb-3',
															},
														},
													},
												}}
											>
												{message.content}
											</Markdown>
										)}
										<div className="bg-secondary rounded-sm max-h-[300px] overflow-auto p-3 mt-2">
											<pre className="text-xs font-mono whitespace-pre">
												{message.codeBlock}
											</pre>
										</div>
									</>
								) : message.scrollableBlock ? (
									<div className="bg-secondary rounded-sm max-h-[300px] overflow-auto p-3">
										{message.scrollableBlock}
									</div>
								) : (
									<Markdown
										className="small-regular leading-relaxed"
										options={{
											overrides: {
												p: {
													props: {
														className:
															'mb-3 last:mb-0',
													},
												},
											},
										}}
									>
										{message.content}
									</Markdown>
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	// User message group
	return (
		<div className="max-w-[85%] ml-auto flex justify-end">
			<div className="bg-card border border-border rounded-lg px-3 items-start gap-3 inline-flex">
				{/* Messages content */}
				<div className="flex-1 space-y-3">
					{messages.map((message, index) => (
						<p
							key={index}
							className="small-regular leading-relaxed"
						>
							{message.content}
						</p>
					))}
				</div>

				{/* User icon */}
				<CircleUserRound
					className="w-6 h-6 text-lime-500 shrink-0 mt-3"
					aria-hidden="true"
				/>
			</div>
		</div>
	);
};

export default GuidedChatMessageGroup;
