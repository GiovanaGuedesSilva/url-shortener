import 'dotenv/config';
import { startServer } from './app.js';
import { closeDatabase } from './src/config/database.js';
import { closeRedis } from './src/config/redis.js';

async function bootstrap() {
	try {
		const server = await startServer();
		console.log('Server started successfully');

		const gracefulShutdown = (signal) => {
			console.log(`${signal} signal received: closing HTTP server`);
			server.close(async () => {
				await closeDatabase();
				await closeRedis();
				console.log('HTTP server closed');
				process.exit(0);
			});
		};

		process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
		process.on('SIGINT', () => gracefulShutdown('SIGINT'));
	} catch (err) {
		console.error('Error starting server:', err);
		process.exit(1);
	}
}

bootstrap();
