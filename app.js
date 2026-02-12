import http from 'http';
import app from './src/infra/http/server.js';
import { connectToDatabase } from './src/config/database.js';
import { connectRedis } from './src/config/redis.js';

export async function startServer() {
	await connectToDatabase();
	await connectRedis();

	const server = http.createServer(app);
	const port = process.env.PORT || 3000;

	server.listen(port, () => {
		console.log(`Server listening on port ${port}`);
	});
}