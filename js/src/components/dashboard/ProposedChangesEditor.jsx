import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TextInput } from '@/components/ui/text-input';
import { AutoResizeTextarea } from '@/components/ui/auto-resize-textarea';
import { TagInput } from '@/components/ui/tag-input';
import { MultipleSelect } from '@/components/ui/multiple-select';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

/**
 * ProposalItem Component
 *
 * A single collapsible proposal item with editable content.
 * Styled according to Figma design with emoji-prefixed titles.
 *
 * @param {Object} proposal - The proposal data
 * @param {string} proposal.id - Unique identifier
 * @param {string} proposal.title - Display title (with emoji prefix)
 * @param {string} proposal.type - Content type ('text', 'textarea', 'meta', 'tags', 'info')
 * @param {string} proposal.value - The editable proposed value
 * @param {string} [proposal.label] - Field label for inputs
 * @param {string} [proposal.description] - Info text for 'info' type
 * @param {string[]} [proposal.tags] - Tags array for 'tags' type
 * @param {string[]} [proposal.categories] - Categories array for 'tags' type
 * @param {string} [proposal.metaTitle] - Meta title for 'meta' type
 * @param {string} [proposal.metaDescription] - Meta description for 'meta' type
 * @param {boolean} proposal.isExpanded - Whether the item is expanded
 * @param {Function} onValueChange - Callback when value changes
 * @param {Function} onToggleExpanded - Callback to toggle expanded state
 */
const ProposalItem = ({ proposal, onValueChange, onToggleExpanded }) => {
	const { id, title, type, isExpanded } = proposal;

	const renderContent = () => {
		// Helper to get input classes based on content
		const getInputClassName = (value) => {
			const isEmpty =
				value === null ||
				value === undefined ||
				(typeof value === 'string' && value.trim() === '');

			return cn(
				'transition-all',
				isEmpty
					? 'border-input bg-white shadow-2xs'
					: 'border-transparent! shadow-none! bg-transparent! hover:border-input! hover:shadow-2xs! hover:bg-white! focus:bg-white! focus:border-input! focus:shadow-2xs!'
			);
		};

		switch (type) {
			case 'text':
				return (
					<div className="flex flex-col gap-1">
						{proposal.label && (
							<Label htmlFor={`proposal-${id}`}>
								{proposal.label}
							</Label>
						)}
						<TextInput
							id={`proposal-${id}`}
							value={proposal.value || ''}
							onChange={(e) => onValueChange(id, e.target.value)}
							className={getInputClassName(proposal.value)}
						/>
					</div>
				);

			case 'textarea':
				return (
					<div className="flex flex-col gap-1">
						{proposal.label && (
							<Label htmlFor={`proposal-${id}`}>
								{proposal.label}
							</Label>
						)}
						<AutoResizeTextarea
							id={`proposal-${id}`}
							value={proposal.value || ''}
							onChange={(e) => onValueChange(id, e.target.value)}
							className={getInputClassName(proposal.value)}
						/>
					</div>
				);

			case 'meta':
				return (
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-1">
							<Label htmlFor={`proposal-${id}-title`}>
								Meta title
							</Label>
							<TextInput
								id={`proposal-${id}-title`}
								value={proposal.metaTitle || ''}
								onChange={(e) =>
									onValueChange(id, {
										metaTitle: e.target.value,
									})
								}
								className={getInputClassName(proposal.metaTitle)}
							/>
						</div>
						<div className="flex flex-col gap-1">
							<Label htmlFor={`proposal-${id}-desc`}>
								Meta description
							</Label>
							<AutoResizeTextarea
								id={`proposal-${id}-desc`}
								value={proposal.metaDescription || ''}
								onChange={(e) =>
									onValueChange(id, {
										metaDescription: e.target.value,
									})
								}
								className={getInputClassName(
									proposal.metaDescription
								)}
							/>
						</div>
					</div>
				);

			case 'tags':
				return (
					<div className="flex flex-col gap-4">
						{/* Tags */}
						<div className="flex flex-col gap-1">
							<Label>Tags</Label>
							<TagInput
								value={proposal.tags || []}
								onChange={(newTags) =>
									onValueChange(id, { tags: newTags })
								}
								placeholder="Add a tag..."
							/>
						</div>

						{/* Categories */}
						<div className="flex flex-col gap-1">
							<Label>Categories</Label>
							<MultipleSelect
								value={proposal.categories || []}
								options={proposal.availableCategories || []}
								onChange={(newCategories) =>
									onValueChange(id, {
										categories: newCategories,
									})
								}
								placeholder="Select categories..."
							/>
						</div>
					</div>
				);

			case 'info':
				return (
					<p className="small-regular text-muted-foreground">
						{proposal.description}
					</p>
				);

			default:
				return null;
		}
	};

	return (
		<Card className="overflow-hidden shadow-sm">
			{/* Header - collapsible trigger */}
			<button
				type="button"
				className="w-full p-6 flex items-center justify-between gap-6 hover:bg-accent/30 transition-colors cursor-pointer"
				onClick={() => onToggleExpanded(id)}
				aria-expanded={isExpanded}
				aria-controls={`proposal-content-${id}`}
			>
				<span className="heading-h4 text-left">{title}</span>
				{isExpanded ? (
					<ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
				) : (
					<ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
				)}
			</button>

			{/* Content - collapsible */}
			{isExpanded && (
				<div
					id={`proposal-content-${id}`}
					className="px-6 pb-6 pt-0 border-t"
				>
					<div className="pt-6">{renderContent()}</div>
				</div>
			)}
		</Card>
	);
};

/**
 * ProposedChangesEditor Component
 *
 * Displays a list of editable, collapsible proposal items.
 * Used in the Page Optimization detail view.
 *
 * @param {Object[]} proposals - Array of proposal objects
 * @param {Function} onUpdateProposal - Callback when a proposal value changes
 * @param {Function} onToggleProposal - Callback to toggle proposal expanded state
 * @param {string} [className=''] - Additional CSS classes
 */
const ProposedChangesEditor = ({
	proposals = [],
	onUpdateProposal,
	onToggleProposal,
	className = '',
}) => {
	if (proposals.length === 0) {
		return null;
	}

	return (
		<div className={`space-y-2 ${className}`.trim()}>
			{proposals.map((proposal) => (
				<ProposalItem
					key={proposal.id}
					proposal={proposal}
					onValueChange={onUpdateProposal}
					onToggleExpanded={onToggleProposal}
				/>
			))}
		</div>
	);
};

export default ProposedChangesEditor;
