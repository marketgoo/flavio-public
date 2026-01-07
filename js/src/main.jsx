import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import App from '@/App.jsx';
import ErrorBoundary from '@/lib/ErrorBoundary.jsx';

// Mount on WordPress-provided container
const container = document.getElementById('flavio');

if (container) {
	createRoot(container).render(
		<StrictMode>
			<ErrorBoundary>
				<App />
			</ErrorBoundary>
		</StrictMode>
	);
} else {
	console.error('Flavio: Mount point #flavio not found in DOM');
}
