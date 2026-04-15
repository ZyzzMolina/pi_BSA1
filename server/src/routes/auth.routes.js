import { Router } from 'express';
import { login, getProfile } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);

export default router;
