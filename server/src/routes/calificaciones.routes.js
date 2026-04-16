import { Router } from 'express';
import * as ctrl from '../controllers/calificaciones.controller.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', authorizeRole('admin'), ctrl.getAll);
router.get('/inscripcion/:id', ctrl.getByInscripcion);
router.get('/grupo/:id', authorizeRole('admin', 'docente'), ctrl.getByGrupo);
router.post('/', authorizeRole('admin', 'docente'), ctrl.create);
router.put('/:id', authorizeRole('admin', 'docente'), ctrl.update);
router.delete('/:id', authorizeRole('admin'), ctrl.remove);

export default router;
