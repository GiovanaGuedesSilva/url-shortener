import { UrlService } from './service.js';
import urlRepository from './repository.js';
import { toUrlResponse, toUrlStatsResponse } from './mapper.js';

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
					errors: ['URL is required'],
				});
			}

			const result = await this.urlService.createShortUrl(url);

			return res.status(201).json(toUrlResponse(result));
		} catch (error) {
			if (error.name === 'ZodError') {
				const messages = (error.issues ?? error.errors)?.map((e) => e.message) ?? ['Invalid data'];
				return res.status(400).json({
					errors: messages,
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

			const url = await this.urlService.getUrlInfo(shortCode);

			if (!url) {
				return res.status(404).json({
					error: 'URL not found',
				});
			}

			return res.json(toUrlResponse(url));
		} catch (error) {
			next(error);
		}
	};

	getUrlStats = async (req, res, next) => {
		try {
			const { shortCode } = req.params;

			// Stats always go directly to DB to return the real access count
			const url = await this.urlRepository.findByShortCode(shortCode);

			if (!url) {
				return res.status(404).json({
					error: 'URL not found',
				});
			}

			return res.json(toUrlStatsResponse(url));
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
					errors: ['URL is required'],
				});
			}

			const updatedUrl = await this.urlService.updateUrl(shortCode, url);

			if (!updatedUrl) {
				return res.status(404).json({
					error: 'URL not found',
				});
			}

			return res.json(toUrlResponse(updatedUrl));
		} catch (error) {
			if (error.name === 'ZodError') {
				const messages = (error.issues ?? error.errors)?.map((e) => e.message) ?? ['Invalid data'];
				return res.status(400).json({
					errors: messages,
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
