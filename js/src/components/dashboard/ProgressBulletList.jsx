import Markdown from 'markdown-to-jsx';

/**
 * Renders a list of progress bullets with Markdown support
 *
 * @param {string[]} items - Array of Markdown-formatted bullet strings
 * @param {Object} [markdownOptions] - Options for markdown-to-jsx renderer
 */
const ProgressBulletList = ({ items, markdownOptions = {} }) => {
	const defaultOptions = {
		forceInline: true,
		overrides: {
			strong: {
				props: { className: 'font-semibold' },
			},
		},
	};

	const options = { ...defaultOptions, ...markdownOptions };

	return (
		<div className="space-y-4 mb-4">
			{items.map((bullet, index) => (
				<div key={index} className="flex items-start gap-3">
					<span className="paragraph-regular mt-0.5 flex-shrink-0">•</span>
					<div className="paragraph-regular">
						<Markdown options={options}>{bullet}</Markdown>
					</div>
				</div>
			))}
		</div>
	);
};

export default ProgressBulletList;

