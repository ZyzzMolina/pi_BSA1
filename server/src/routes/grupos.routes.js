import { Router } from 'express';
import * as ctrl from '../controllers/grupos.controller.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', ctrl.getAll);
router.get('/docente/:id', authorizeRole('admin', 'docente'), ctrl.getByDocente);
router.get('/:id/alumnos', authorizeRole('admin', 'docente'), ctrl.getAlumnosByGrupo);
router.get('/:id', ctrl.getById);
router.post('/', authorizeRole('admin'), ctrl.create);
router.put('/:id', authorizeRole('admin'), ctrl.update);
router.delete('/:id', authorizeRole('admin'), ctrl.remove);

export default router;
