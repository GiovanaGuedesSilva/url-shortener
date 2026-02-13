import { UrlService } from './service.js';
import urlRepository from './repository.js';

class UrlController {
	constructor() {
		this.urlService = new UrlService(urlRepository);
		this.urlRepository = urlRepository;
	}

	createShortUrl = async (req, res, next) => {
		try {
			const { url } = req.body;

			if (!url) {
				return res.status(400).json({
					error: 'URL is required',
				});
			}

			const result = await this.urlService.createShortUrl(url);

			return res.status(201).json({
				id: result.id,
				url: result.url,
				shortCode: result.shortCode,
				createdAt: result.createdAt,
				updatedAt: result.updatedAt,
			});
		} catch (error) {
			if (error.name === 'ZodError') {
				return res.status(400).json({
					error: 'Invalid data',
					details: error.errors,
				});
			}
			next(error);
		}
	};

	redirectToOriginalUrl = async (req, res, next) => {
		try {
			const { shortCode } = req.params;

			const url = await this.urlService.getOriginalUrl(shortCode);

			if (!url) {
				return res.status(404).json({
					error: 'URL not found',
				});
			}

			return res.redirect(301, url.url);
		} catch (error) {
			next(error);
		}
	};

	getUrlInfo = async (req, res, next) => {
		try {
			const { shortCode } = req.params;

			const url = await this.urlService.getOriginalUrl(shortCode);

			if (!url) {
				return res.status(404).json({
					error: 'URL not found',
				});
			}

			return res.json({
				id: url.id,
				url: url.url,
				shortCode: url.shortCode,
				createdAt: url.createdAt,
				updatedAt: url.updatedAt,
			});
		} catch (error) {
			next(error);
		}
	};

	getUrlStats = async (req, res, next) => {
		try {
			const { shortCode } = req.params;

			const url = await this.urlRepository.findByShortCode(shortCode);

			if (!url) {
				return res.status(404).json({
					error: 'URL not found',
				});
			}

			return res.json({
				id: url.id,
				url: url.url,
				shortCode: url.shortCode,
				createdAt: url.createdAt,
				updatedAt: url.updatedAt,
				accessCount: url.accessCount,
			});
		} catch (error) {
			next(error);
		}
	};

	updateShortUrl = async (req, res, next) => {
		try {
			const { shortCode } = req.params;
			const { url } = req.body;

			if (!url) {
				return res.status(400).json({
					error: 'URL is required',
				});
			}

			const updatedUrl = await this.urlService.updateUrl(shortCode, url);

			if (!updatedUrl) {
				return res.status(404).json({
					error: 'URL not found',
				});
			}

			return res.json({
				id: updatedUrl.id,
				url: updatedUrl.url,
				shortCode: updatedUrl.shortCode,
				createdAt: updatedUrl.createdAt,
				updatedAt: updatedUrl.updatedAt,
			});
		} catch (error) {
			if (error.name === 'ZodError') {
				return res.status(400).json({
					error: 'Invalid data',
					details: error.errors,
				});
			}
			next(error);
		}
	};

	deleteShortUrl = async (req, res, next) => {
		try {
			const { shortCode } = req.params;

			const deleted = await this.urlService.deleteUrl(shortCode);

			if (!deleted) {
				return res.status(404).json({
					error: 'URL not found',
				});
			}

			return res.status(204).send();
		} catch (error) {
			next(error);
		}
	};
}

export default new UrlController(); 