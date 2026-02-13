import { Router } from 'express';
import urlController from './controller.js';

const router = Router();

router.post('/shorten', urlController.createShortUrl);
router.get('/shorten/:shortCode', urlController.getUrlInfo);
router.put('/shorten/:shortCode', urlController.updateShortUrl);
router.delete('/shorten/:shortCode', urlController.deleteShortUrl);
router.get('/shorten/:shortCode/stats', urlController.getUrlStats);
router.get('/:shortCode', urlController.redirectToOriginalUrl);

export default router;