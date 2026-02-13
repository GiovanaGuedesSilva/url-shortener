import { createClient } from 'redis';

let redisClient;

export async function connectRedis() {
	try {
		redisClient = createClient({
			socket: {
				host: process.env.REDIS_HOST || 'localhost',
				port: process.env.REDIS_PORT || 6379,
			},
			password: process.env.REDIS_PASSWORD || undefined,
		});

		redisClient.on('error', (err) => {
			console.error('Redis Client Error:', err);
		});

		await redisClient.connect();
		console.log('✓ Redis connected successfully');
	} catch (error) {
		console.warn('✗ Redis unavailable, running without cache:', error.message);
		redisClient = null;
	}
}

export function getRedisClient() {
	return redisClient ?? null;
}

export async function closeRedis() {
	if (redisClient) {
		await redisClient.quit();
		redisClient = null;
		console.log('Redis connection closed');
	}
}
