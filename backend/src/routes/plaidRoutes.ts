import { Router } from 'express';
import { PlaidController } from '../controllers/plaidController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/create-link-token', authMiddleware, PlaidController.createLinkToken);
router.post('/exchange-token', authMiddleware, PlaidController.exchangePublicToken);
router.post('/sync-transactions', authMiddleware, PlaidController.syncTransactions);
router.get('/connections', authMiddleware, PlaidController.getConnections);
router.delete('/connections/:connectionId', authMiddleware, PlaidController.removeConnection);

export default router;