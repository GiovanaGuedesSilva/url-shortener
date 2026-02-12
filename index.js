import { startServer } from './app.js';

async function bootstrap() {
	try {
		await startServer();
		console.log('Server started successfully');
	} catch (err) {
		console.error('Error starting server:', err);
		process.exit(1);
	}
}

bootstrap();