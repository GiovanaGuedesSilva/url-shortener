import { urlRoutes } from '../../modules/url/index.js';

export function registerRoutes(app) {
	app.get('/health', (req, res) => {
		res.json({
			status: 'OK',
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
		});
	});

	app.use('/', urlRoutes);

	app.use((req, res) => {
		res.status(404).json({
			error: 'Route not found',
			path: req.path,
		});
	});
}