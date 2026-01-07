/**
 * DevTools Panel
 *
 * Development-only panel for viewing and editing flavioData configuration
 * and monitoring PostHog events.
 */

import { useState, useRef, useEffect } from 'react';
import {
	X,
	Copy,
	Check,
	RotateCcw,
	ChevronRight,
	ChevronDown,
	Code,
	Database,
	Activity,
	Trash2,
} from 'lucide-react';
import useDevConfig from './hooks/useDevConfig';
import useEventCapture from './hooks/useEventCapture';

// ============================================================================
// Main Component
// ============================================================================

/**
 * DevTools Component
 *
 * Floating panel with tabs for:
 * - Flavio Data: View and edit flavioData configuration
 * - Events: Monitor PostHog events in real-time
 */
const DevTools = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [activeTab, setActiveTab] = useState('data');

	const {
		overrides,
		effectiveConfig,
		updateOverride,
		removeOverride,
		resetOverrides,
		hasOverride,
	} = useDevConfig();

	const { events, clearEvents } = useEventCapture();

	const hasAnyOverrides = Object.keys(overrides).length > 0;

	const tabs = [
		{ id: 'data', label: 'Flavio Data', icon: Database },
		{ id: 'events', label: 'Events', icon: Activity, badge: events.length },
	];

	return (
		<>
			{/* Floating Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="fixed bottom-4 left-6 z-[99999] w-12 h-12 rounded-full bg-blue-900 text-white shadow-lg hover:bg-blue-800 transition-colors flex items-center justify-center"
				title="Open DevTools"
			>
				{isOpen ? (
					<X className="w-5 h-5" />
				) : (
					<>
						<Code className="w-5 h-5" />
						{hasAnyOverrides && (
							<span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full" />
						)}
					</>
				)}
			</button>

			{/* Panel */}
			{isOpen && (
				<div className="fixed bottom-20 left-6 z-[99998] w-[620px] max-h-[70vh] bg-zinc-900 text-zinc-100 rounded-lg shadow-2xl border border-zinc-700 flex flex-col overflow-hidden font-mono text-sm">
					{/* Header */}
					<div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700 bg-zinc-800">
						<div className="flex items-center gap-2">
							<Code className="w-4 h-4 text-sky-400" />
							<span className="font-semibold">
								Flavio DevTools
							</span>
						</div>
					</div>

					{/* Tabs */}
					<div className="flex border-b border-zinc-700 bg-zinc-800/50">
						{tabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
									activeTab === tab.id
										? 'text-sky-400 border-b-2 border-sky-400 bg-zinc-800'
										: 'text-zinc-400 hover:text-zinc-200'
								}`}
							>
								<tab.icon className="w-4 h-4" />
								{tab.label}
								{tab.badge > 0 && (
									<span className="px-1.5 py-0.5 text-xs bg-sky-500/20 text-sky-400 rounded">
										{tab.badge}
									</span>
								)}
							</button>
						))}
					</div>

					{/* Tab Content */}
					<div className="flex-1 overflow-hidden flex flex-col">
						{activeTab === 'data' && (
							<FlavioDataTab
								effectiveConfig={effectiveConfig}
								overrides={overrides}
								updateOverride={updateOverride}
								removeOverride={removeOverride}
								resetOverrides={resetOverrides}
								hasOverride={hasOverride}
								hasAnyOverrides={hasAnyOverrides}
							/>
						)}
						{activeTab === 'events' && (
							<EventsTab
								events={events}
								clearEvents={clearEvents}
							/>
						)}
					</div>
				</div>
			)}
		</>
	);
};

// ============================================================================
// Tab Components
// ============================================================================

/**
 * Flavio Data Tab - View and edit configuration
 */
const FlavioDataTab = ({
	effectiveConfig,
	overrides,
	updateOverride,
	removeOverride,
	resetOverrides,
	hasOverride,
	hasAnyOverrides,
}) => {
	return (
		<>
			{/* Toolbar */}
			<div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700 bg-zinc-800/30">
				<div className="flex items-center gap-2">
					{hasAnyOverrides && (
						<span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded">
							{Object.keys(overrides).length} override(s)
						</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					{hasAnyOverrides && (
						<button
							onClick={resetOverrides}
							className="flex items-center gap-1 px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 rounded transition-colors"
							title="Reset all overrides"
						>
							<RotateCcw className="w-3 h-3" />
							Reset
						</button>
					)}
					<CopyButton
						value={JSON.stringify(effectiveConfig, null, 2)}
						label="Copy All"
					/>
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto p-2">
				<ConfigTree
					data={effectiveConfig}
					path=""
					overrides={overrides}
					onUpdate={updateOverride}
					onRemove={removeOverride}
					hasOverride={hasOverride}
				/>
			</div>

			{/* Footer */}
			<div className="px-4 py-2 border-t border-zinc-700 bg-zinc-800 text-xs text-zinc-500">
				Click values to edit • Overrides persist in localStorage across
				sessions
			</div>
		</>
	);
};

/**
 * Events Tab - Monitor PostHog events
 */
const EventsTab = ({ events, clearEvents }) => {
	const [selectedEvent, setSelectedEvent] = useState(null);

	return (
		<>
			{/* Toolbar */}
			<div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700 bg-zinc-800/30">
				<span className="text-xs text-zinc-400">
					{events.length} event(s) captured
				</span>
				<button
					onClick={clearEvents}
					className="flex items-center gap-1 px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 rounded transition-colors"
					title="Clear all events"
				>
					<Trash2 className="w-3 h-3" />
					Clear
				</button>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto">
				{events.length === 0 ? (
					<div className="flex items-center justify-center h-32 text-zinc-500">
						No events captured yet
					</div>
				) : (
					<div className="divide-y divide-zinc-800">
						{events.map((event) => (
							<EventRow
								key={event.id}
								event={event}
								isSelected={selectedEvent?.id === event.id}
								onSelect={() =>
									setSelectedEvent(
										selectedEvent?.id === event.id
											? null
											: event
									)
								}
							/>
						))}
					</div>
				)}
			</div>

			{/* Footer */}
			<div className="px-4 py-2 border-t border-zinc-700 bg-zinc-800 text-xs text-zinc-500">
				Click event to expand details • Max 50 events stored
			</div>
		</>
	);
};

/**
 * Single event row
 */
const EventRow = ({ event, isSelected, onSelect }) => {
	const time = event.timestamp.toLocaleTimeString('en-US', {
		hour12: false,
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	});

	const hasProperties = Object.keys(event.properties).length > 0;

	return (
		<div className="group">
			<button
				onClick={onSelect}
				className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-zinc-800 transition-colors ${
					isSelected ? 'bg-zinc-800' : ''
				}`}
			>
				<span className="text-zinc-500 text-xs shrink-0">{time}</span>
				<span className="text-sky-400 truncate flex-1">
					{event.eventName}
				</span>
				{hasProperties && (
					<span className="text-zinc-500 text-xs">
						{Object.keys(event.properties).length} prop(s)
					</span>
				)}
				<div className="opacity-0 group-hover:opacity-100 transition-opacity">
					<CopyButton
						value={JSON.stringify(event, null, 2)}
						size="xs"
					/>
				</div>
			</button>

			{isSelected && hasProperties && (
				<div className="px-4 py-2 bg-zinc-800/50 border-t border-zinc-700">
					<pre className="text-xs text-zinc-400 whitespace-pre-wrap overflow-x-auto">
						{JSON.stringify(event.properties, null, 2)}
					</pre>
				</div>
			)}
		</div>
	);
};

// ============================================================================
// Shared Components
// ============================================================================

/**
 * Recursive tree view for configuration object
 */
const ConfigTree = ({
	data,
	path,
	overrides,
	onUpdate,
	onRemove,
	hasOverride,
	level = 0,
}) => {
	if (data === null || data === undefined) {
		return (
			<ValueDisplay
				value={data}
				path={path}
				onUpdate={onUpdate}
				hasOverride={hasOverride}
				onRemove={onRemove}
			/>
		);
	}

	if (typeof data !== 'object') {
		return (
			<ValueDisplay
				value={data}
				path={path}
				onUpdate={onUpdate}
				hasOverride={hasOverride}
				onRemove={onRemove}
			/>
		);
	}

	if (Array.isArray(data)) {
		return (
			<ArrayNode
				data={data}
				path={path}
				overrides={overrides}
				onUpdate={onUpdate}
				onRemove={onRemove}
				hasOverride={hasOverride}
				level={level}
			/>
		);
	}

	return (
		<ObjectNode
			data={data}
			path={path}
			overrides={overrides}
			onUpdate={onUpdate}
			onRemove={onRemove}
			hasOverride={hasOverride}
			level={level}
		/>
	);
};

/**
 * Object node with collapsible children
 */
const ObjectNode = ({
	data,
	path,
	overrides,
	onUpdate,
	onRemove,
	hasOverride,
	level,
}) => {
	const entries = Object.entries(data);

	return (
		<div className="space-y-0.5">
			{entries.map(([key, value]) => {
				const currentPath = path ? `${path}.${key}` : key;
				const isObject = value !== null && typeof value === 'object';

				return (
					<PropertyRow
						key={currentPath}
						name={key}
						value={value}
						path={currentPath}
						isObject={isObject}
						overrides={overrides}
						onUpdate={onUpdate}
						onRemove={onRemove}
						hasOverride={hasOverride}
						level={level}
					/>
				);
			})}
		</div>
	);
};

/**
 * Array node display
 */
const ArrayNode = ({ data }) => {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<div>
			<button
				onClick={() => setIsExpanded(!isExpanded)}
				className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200"
			>
				{isExpanded ? (
					<ChevronDown className="w-3 h-3" />
				) : (
					<ChevronRight className="w-3 h-3" />
				)}
				<span className="text-purple-400">Array[{data.length}]</span>
			</button>
			{isExpanded && (
				<div className="ml-4 mt-1 pl-2 border-l border-zinc-700">
					<pre className="text-xs text-zinc-400 whitespace-pre-wrap">
						{JSON.stringify(data, null, 2)}
					</pre>
					<CopyButton
						value={JSON.stringify(data, null, 2)}
						size="sm"
					/>
				</div>
			)}
		</div>
	);
};

/**
 * Single property row with key and value
 */
const PropertyRow = ({
	name,
	value,
	path,
	isObject,
	overrides,
	onUpdate,
	onRemove,
	hasOverride,
	level,
}) => {
	const [isExpanded, setIsExpanded] = useState(level < 1);
	const isOverridden = hasOverride(path);

	return (
		<div className="group">
			<div
				className={`flex items-start gap-2 px-2 py-1 rounded hover:bg-zinc-800 ${
					isOverridden ? 'bg-amber-500/10' : ''
				}`}
				style={{ paddingLeft: `${level * 12 + 8}px` }}
			>
				{isObject ? (
					<button
						onClick={() => setIsExpanded(!isExpanded)}
						className="flex items-center gap-1 shrink-0 text-zinc-400 hover:text-zinc-200 mt-0.5"
					>
						{isExpanded ? (
							<ChevronDown className="w-3 h-3" />
						) : (
							<ChevronRight className="w-3 h-3" />
						)}
					</button>
				) : (
					<span className="w-3 shrink-0" />
				)}

				<span
					className={`shrink-0 ${isOverridden ? 'text-amber-400' : 'text-sky-400'}`}
				>
					{name}
					{isOverridden && (
						<span className="ml-1 text-amber-500">*</span>
					)}
				</span>
				<span className="text-zinc-500">:</span>

				{isObject ? (
					<span className="text-zinc-500 text-xs">
						{Array.isArray(value)
							? `Array[${value.length}]`
							: `{${Object.keys(value).length}}`}
					</span>
				) : (
					<div className="flex-1 flex items-center gap-2 min-w-0">
						<ValueDisplay
							value={value}
							path={path}
							onUpdate={onUpdate}
							hasOverride={hasOverride}
							onRemove={onRemove}
						/>
					</div>
				)}
			</div>

			{isObject && isExpanded && (
				<div className="border-l border-zinc-700 ml-4">
					<ConfigTree
						data={value}
						path={path}
						overrides={overrides}
						onUpdate={onUpdate}
						onRemove={onRemove}
						hasOverride={hasOverride}
						level={level + 1}
					/>
				</div>
			)}
		</div>
	);
};

/**
 * Value display with inline editing
 */
const ValueDisplay = ({ value, path, onUpdate, hasOverride, onRemove }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState('');
	const inputRef = useRef(null);
	const selectRef = useRef(null);
	const isOverridden = hasOverride(path);

	const displayValue =
		value === null
			? 'null'
			: value === undefined
				? 'undefined'
				: String(value);
	const valueType = value === null ? 'null' : typeof value;
	const isBooleanOrNull = valueType === 'boolean' || valueType === 'null';

	const getValueColor = () => {
		if (value === null || value === undefined) return 'text-zinc-500';
		if (typeof value === 'boolean')
			return value ? 'text-green-400' : 'text-red-400';
		if (typeof value === 'number') return 'text-orange-400';
		if (typeof value === 'string') return 'text-emerald-400';
		return 'text-zinc-300';
	};

	const handleStartEdit = () => {
		setEditValue(valueType === 'string' ? value : JSON.stringify(value));
		setIsEditing(true);
	};

	const handleSave = () => {
		try {
			let newValue;
			if (valueType === 'number') {
				newValue = Number(editValue);
			} else if (editValue === 'null') {
				newValue = null;
			} else {
				// Try to parse as JSON first
				try {
					newValue = JSON.parse(editValue);
				} catch {
					newValue = editValue;
				}
			}
			onUpdate(path, newValue);
		} catch {
			// Keep as string if parsing fails
			onUpdate(path, editValue);
		}
		setIsEditing(false);
	};

	const handleBooleanChange = (e) => {
		const val = e.target.value;
		let newValue;
		if (val === 'true') newValue = true;
		else if (val === 'false') newValue = false;
		else newValue = null;

		onUpdate(path, newValue);
		setIsEditing(false);
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			handleSave();
		} else if (e.key === 'Escape') {
			setIsEditing(false);
		}
	};

	useEffect(() => {
		if (isEditing) {
			if (isBooleanOrNull && selectRef.current) {
				selectRef.current.focus();
			} else if (inputRef.current) {
				inputRef.current.focus();
				inputRef.current.select();
			}
		}
	}, [isEditing, isBooleanOrNull]);

	// Boolean/null dropdown editor
	if (isEditing && isBooleanOrNull) {
		return (
			<div className="flex items-center gap-1 flex-1">
				<select
					ref={selectRef}
					value={displayValue}
					onChange={handleBooleanChange}
					onBlur={() => setIsEditing(false)}
					onKeyDown={(e) => e.key === 'Escape' && setIsEditing(false)}
					className="bg-zinc-700 text-zinc-100 px-2 py-0.5 rounded text-sm border border-sky-500 outline-none cursor-pointer"
				>
					<option value="true" className="text-green-400">
						true
					</option>
					<option value="false" className="text-red-400">
						false
					</option>
					<option value="null" className="text-zinc-400">
						null
					</option>
				</select>
			</div>
		);
	}

	// Text input editor for other types
	if (isEditing) {
		return (
			<div className="flex items-center gap-1 flex-1">
				<input
					ref={inputRef}
					type="text"
					value={editValue}
					onChange={(e) => setEditValue(e.target.value)}
					onBlur={handleSave}
					onKeyDown={handleKeyDown}
					className="flex-1 bg-zinc-700 text-zinc-100 px-2 py-0.5 rounded text-sm border border-sky-500 outline-none min-w-0"
				/>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-1 min-w-0 flex-1 group/value">
			<button
				onClick={handleStartEdit}
				className={`truncate text-left hover:underline cursor-pointer ${getValueColor()}`}
				title={`Click to edit • Current: ${displayValue}`}
			>
				{valueType === 'string' ? `"${displayValue}"` : displayValue}
			</button>

			<div className="flex items-center gap-1 opacity-0 group-hover/value:opacity-100 transition-opacity shrink-0">
				<CopyButton value={displayValue} size="xs" />
				{isOverridden && (
					<button
						onClick={() => onRemove(path)}
						className="p-0.5 hover:bg-zinc-600 rounded text-amber-400 hover:text-amber-300"
						title="Remove override"
					>
						<RotateCcw className="w-3 h-3" />
					</button>
				)}
			</div>
		</div>
	);
};

/**
 * Copy to clipboard button
 */
const CopyButton = ({ value, label, size = 'sm' }) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch (e) {
			console.error('Failed to copy:', e);
		}
	};

	const sizeClasses = {
		xs: 'p-0.5',
		sm: 'px-2 py-1 text-xs',
	};

	return (
		<button
			onClick={handleCopy}
			className={`flex items-center gap-1 bg-zinc-700 hover:bg-zinc-600 rounded transition-colors ${sizeClasses[size]}`}
			title="Copy to clipboard"
		>
			{copied ? (
				<Check className="w-3 h-3 text-green-400" />
			) : (
				<Copy className="w-3 h-3" />
			)}
			{label && <span>{label}</span>}
		</button>
	);
};

export default DevTools;
