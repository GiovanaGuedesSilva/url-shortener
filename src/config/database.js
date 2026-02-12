import pg from 'pg';
const { Pool } = pg;

let pool;

export async function connectToDatabase() {
	try {
		pool = new Pool({
			host: process.env.DB_HOST || 'localhost',
			port: process.env.DB_PORT || 5432,
			database: process.env.DB_NAME || 'urlshortener',
			user: process.env.DB_USER || 'postgres',
			password: process.env.DB_PASSWORD || 'postgres',
		});

		// Testa a conexão
		await pool.query('SELECT NOW()');
		console.log('✓ Database connected successfully');
	} catch (error) {
		console.error('✗ Database connection failed:', error);
		throw error;
	}
}

export function getPool() {
	if (!pool) {
		throw new Error('Database not initialized. Call connectToDatabase first.');
	}
	return pool;
}

export async function closeDatabase() {
	if (pool) {
		await pool.end();
		console.log('Database connection closed');
	}
}
