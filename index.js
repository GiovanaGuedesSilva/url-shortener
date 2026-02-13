import { startServer } from './app.js';

async function bootstrap() {
	try {
		const server = await startServer();
		console.log('Server started successfully');

		process.on('SIGTERM', () => {
			console.log('SIGTERM signal received: closing HTTP server');
			server.close(() => {
				console.log('HTTP server closed');
				process.exit(0);
			});
		});

		process.on('SIGINT', () => {
			console.log('\nSIGINT signal received: closing HTTP server');
			server.close(() => {
				console.log('HTTP server closed');
				process.exit(0);
			});
		});
	} catch (err) {
		console.error('Error starting server:', err);
		process.exit(1);
	}
}

bootstrap();