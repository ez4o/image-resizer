import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		sveltekit(),
		{
			name: 'configure-response-headers',
			configureServer: (server) => {
				server.middlewares.use((_, res, next) => {
					res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
					res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
					next();
				});
			}
		}
	]
};

export default config;
