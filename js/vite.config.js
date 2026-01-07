import { defineConfig } from 'vite';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

const DEV_SERVER_URL = 'http://localhost:5173';

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => ({
	plugins: [tailwindcss()],
	esbuild: {
		jsxInject: `import React from 'react'`,
		jsxFactory: 'React.createElement',
		jsxFragment: 'React.Fragment',
		// Remove console.log and debugger in production builds
		drop: mode === 'production' ? ['console', 'debugger'] : [],
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	server: {
		port: 5173,
		strictPort: true,
		cors: true,
		origin: DEV_SERVER_URL,
	},
	build: {
		// Output to dist/ for WordPress integration
		outDir: 'dist',
		// Generate assets in assets/ subdirectory
		assetsDir: 'assets',
		// Don't minify for easier debugging (optional, can be true for production)
		minify: 'esbuild',
		// Generate manifest for cache-busted filenames
		manifest: true,
		rollupOptions: {
			// Entry point for the app
			input: '/src/main.jsx',
			output: {
				// Predictable naming for easier PHP integration
				entryFileNames: 'assets/[name]-[hash].js',
				chunkFileNames: 'assets/[name]-[hash].js',
				assetFileNames: 'assets/[name]-[hash].[ext]',
			},
		},
	},
	// Base URL: absolute for dev (so assets load from Vite server), relative for build
	base: command === 'serve' ? DEV_SERVER_URL : './',
}));
