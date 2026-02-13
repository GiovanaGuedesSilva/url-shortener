import { urlSchema } from './schema.js';
import { generateShortCode } from '../../shared/utils/generateShortCode.js';
import { getRedisClient } from '../../config/redis.js';

export class UrlService {
	constructor(urlRepository) {
		this.urlRepository = urlRepository;
	}

	async createShortUrl(originalUrl) {
		const validated = urlSchema.parse({ url: originalUrl });

		let shortCode;
		let exists = true;
		let attempts = 0;
		const maxAttempts = 10;

		while (exists && attempts < maxAttempts) {
			shortCode = generateShortCode();
			exists = await this.urlRepository.exists(shortCode);
			attempts++;
		}

		if (exists) {
			throw new Error('Unable to generate a unique code. Please try again.');
		}

		const createdUrl = await this.urlRepository.create({
			originalUrl: validated.url,
			shortCode,
		});

		try {
			const redis = getRedisClient();
			if (redis) {
				await redis.setEx(
					`url:${shortCode}`,
					60 * 60 * 24,
					JSON.stringify(createdUrl)
				);
			}
		} catch (error) {
			console.error('Error caching URL:', error);
		}

		return createdUrl;
	}

	async getOriginalUrl(shortCode) {
		try {
			const redis = getRedisClient();
			if (redis) {
				const cached = await redis.get(`url:${shortCode}`);
				if (cached) {
					const url = JSON.parse(cached);
					this.urlRepository.incrementAccessCount(shortCode).catch(err => {
						console.error('Error incrementing counter:', err);
					});
					return url;
				}
			}
		} catch (error) {
			console.error('Error fetching from cache:', error);
		}

		const url = await this.urlRepository.findByShortCode(shortCode);
		
		if (url) {
			await this.urlRepository.incrementAccessCount(shortCode);

			try {
				const redis = getRedisClient();
				if (redis) {
					await redis.setEx(
						`url:${shortCode}`,
						60 * 60 * 24,
						JSON.stringify(url)
					);
				}
			} catch (error) {
				console.error('Error caching URL:', error);
			}
		}

		return url;
	}

	async invalidateCache(shortCode) {
		try {
			const redis = getRedisClient();
			if (redis) await redis.del(`url:${shortCode}`);
		} catch (error) {
			console.error('Error invalidating cache:', error);
		}
	}

	async updateUrl(shortCode, newUrl) {
		const validated = urlSchema.parse({ url: newUrl });

		const updatedUrl = await this.urlRepository.update({
			shortCode,
			url: validated.url,
		});

		if (!updatedUrl) {
			return null;
		}

		await this.invalidateCache(shortCode);

		return updatedUrl;
	}

	async deleteUrl(shortCode) {
		const deleted = await this.urlRepository.delete(shortCode);

		if (deleted) {
			await this.invalidateCache(shortCode);
		}

		return deleted;
	}
}