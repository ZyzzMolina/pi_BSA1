import { Router } from 'express';
import * as ctrl from '../controllers/consultas.controller.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// Dashboard stats (solo admin)
router.get('/stats', authorizeRole('admin'), ctrl.dashboardStats);

// Consultas obligatorias (solo admin)
router.get('/historial/:id', authorizeRole('admin', 'alumno'), ctrl.historialAlumno);
router.get('/promedios', authorizeRole('admin'), ctrl.promediosPorAlumno);
router.get('/promedio-superior', authorizeRole('admin'), ctrl.alumnosPromedioSuperior);
router.get('/reprobados', authorizeRole('admin'), ctrl.alumnosReprobados);

// Consulta PLUS (HAVING) - solo admin
router.get('/materias-mejor-promedio', authorizeRole('admin'), ctrl.materiasMejorPromedio);

// Vistas (admin y alumno pueden ver sus promedios)
router.get('/vista-historial', authorizeRole('admin'), ctrl.vistaHistorial);
router.get('/vista-promedios', authorizeRole('admin', 'alumno', 'docente'), ctrl.vistaPromedios);

export default router;
