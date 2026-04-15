import { Router } from 'express';
import * as ctrl from '../controllers/inscripciones.controller.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', authorizeRole('admin'), ctrl.getAll);
router.get('/alumno/:id', ctrl.getByAlumno);
router.get('/grupo/:id', ctrl.getAlumnosByGrupo);
router.post('/', authorizeRole('admin'), ctrl.create);
router.delete('/:id', authorizeRole('admin'), ctrl.remove);

export default router;
