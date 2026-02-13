import { getPool } from '../../config/database.js';

class UrlRepository {
	async findByShortCode(shortCode) {
		const pool = getPool();
		const query = `
			SELECT	id, url, 
					short_code AS "shortCode",
					access_count AS "accessCount",
					created_at AS "createdAt", 
					updated_at AS "updatedAt"
			FROM	urls
			WHERE	short_code = $1
			LIMIT 	1
		`;

		const { rows } = await pool.query(query, [shortCode]);
		return rows[0] || null;
	}

	async exists(shortCode) {
		const pool = getPool();
		const query = `
			SELECT	1
			FROM	urls
			WHERE	short_code = $1
			LIMIT	1
		`;
		const { rows } = await pool.query(query, [shortCode]);
		return rows.length > 0;
	}

	async create({ originalUrl, shortCode }) {
		const pool = getPool();
		const query = `
			INSERT		INTO urls (url, short_code)
			VALUES		($1, $2)
			RETURNING	id, url, short_code AS "shortCode", access_count AS "accessCount", created_at AS "createdAt", updated_at AS "updatedAt"
		`;
		const { rows } = await pool.query(query, [originalUrl, shortCode]);
		return rows[0];
	}

	async incrementAccessCount(shortCode) {
		const pool = getPool();
		const query = `
			UPDATE	urls
			SET		access_count = access_count + 1, 
					updated_at = NOW()
			WHERE	short_code = $1`;
		await pool.query(query, [shortCode]);
	}

	async update({ shortCode, url }) {
		const pool = getPool();
		const query = `
			UPDATE		urls
			SET			url = $1,
						updated_at = NOW()
			WHERE		short_code = $2
			RETURNING	id, url, short_code AS "shortCode", access_count AS "accessCount", created_at AS "createdAt", updated_at AS "updatedAt"
		`;
		const { rows } = await pool.query(query, [url, shortCode]);
		return rows[0] || null;
	}

	async delete(shortCode) {
		const pool = getPool();
		const query = `
			DELETE FROM urls
			WHERE short_code = $1
			RETURNING id
		`;
		const { rows } = await pool.query(query, [shortCode]);
		return rows.length > 0;
	}
}

export default new UrlRepository();