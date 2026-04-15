import { Router } from 'express';
import * as ctrl from '../controllers/consultas.controller.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// Dashboard stats
router.get('/stats', ctrl.dashboardStats);

// Consultas obligatorias
router.get('/historial/:id', ctrl.historialAlumno);
router.get('/promedios', ctrl.promediosPorAlumno);
router.get('/promedio-superior', ctrl.alumnosPromedioSuperior);
router.get('/reprobados', ctrl.alumnosReprobados);

// Consulta PLUS (HAVING)
router.get('/materias-mejor-promedio', ctrl.materiasMejorPromedio);

// Vistas
router.get('/vista-historial', ctrl.vistaHistorial);
router.get('/vista-promedios', ctrl.vistaPromedios);

export default router;
