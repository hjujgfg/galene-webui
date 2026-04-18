import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
	plugins: [
		sveltekit(),
		basicSsl()
	],
	server: {
		host: true,
		proxy: {
			'/ws': {
				target: 'ws://localhost:8443',
				ws: true,
				secure: false
			}
		}
	}
});
