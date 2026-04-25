import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import alumnosRoutes from './routes/alumnos.routes.js';
import docentesRoutes from './routes/docentes.routes.js';
import materiasRoutes from './routes/materias.routes.js';
import gruposRoutes from './routes/grupos.routes.js';
import inscripcionesRoutes from './routes/inscripciones.routes.js';
import calificacionesRoutes from './routes/calificaciones.routes.js';
import consultasRoutes from './routes/consultas.routes.js';
import periodosDocenteRoutes from './routes/periodos_docente.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/docentes', docentesRoutes);
app.use('/api/materias', materiasRoutes);
app.use('/api/grupos', gruposRoutes);
app.use('/api/inscripciones', inscripcionesRoutes);
app.use('/api/calificaciones', calificacionesRoutes);
app.use('/api/consultas', consultasRoutes);
app.use('/api/periodos-docente', periodosDocenteRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Sistema Académico API activo', timestamp: new Date().toISOString() });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📚 API disponible en http://localhost:${PORT}/api`);
});
