import { Router } from 'express';
import * as ctrl from '../controllers/periodos_docente.controller.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// Admin endpoints
router.get('/', authorizeRole('admin'), ctrl.getAll);
router.post('/', authorizeRole('admin'), ctrl.create);
router.put('/:id', authorizeRole('admin'), ctrl.toggleActive);
router.delete('/:id', authorizeRole('admin'), ctrl.remove);

// Docente endpoints
router.get('/docente/:id_docente', ctrl.getByDocente);
router.get('/docente/:id_docente/activos', ctrl.getActivosByDocente);

export default router;
