import { Router } from 'express';
import { NordigenController } from '../controllers/NordigenController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/create-link', authMiddleware, NordigenController.createLink);
router.post('/fetch-accounts', authMiddleware, NordigenController.fetchAccounts);

export default router;