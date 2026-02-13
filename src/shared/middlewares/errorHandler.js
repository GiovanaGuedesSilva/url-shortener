export function errorHandler(err, req, res, next) {
	console.error('Error:', err);

	if (res.headersSent) {
		return next(err);
	}

	const statusCode = err.statusCode || err.status || 500;
	const message = err.message || 'Internal Server Error';

	res.status(statusCode).json({
		error: {
			message,
			status: statusCode,
			...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
		},
	});
}
