import pool from '../config/db.js';

// Consulta 1: Historial académico de un alumno (JOIN)
export const historialAlumno = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validar que el alumno solo vea su propio historial
        if (req.user.role === 'alumno' && req.user.id_alumno != id) {
            return res.status(403).json({ error: 'No puedes ver el historial de otro alumno' });
        }
        
        const result = await pool.query(`
      SELECT
        a.nombre || ' ' || a.apellido AS alumno,
        m.nombre AS materia,
        m.clave,
        g.periodo,
        c.calificacion,
        c.periodo_eval,
        fn_estatus_alumno(a.id_alumno) AS estatus
      FROM alumnos a
      JOIN inscripciones i ON a.id_alumno = i.id_alumno
      JOIN grupos g ON i.id_grupo = g.id_grupo
      JOIN materias m ON g.id_materia = m.id_materia
      LEFT JOIN calificaciones c ON i.id_inscripcion = c.id_inscripcion
      WHERE a.id_alumno = $1
      ORDER BY m.nombre, c.periodo_eval
    `, [id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener historial' });
    }
};

// Consulta 2: Promedio por alumno (AVG + GROUP BY)
export const promediosPorAlumno = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT
        a.id_alumno,
        a.nombre || ' ' || a.apellido AS alumno,
        ROUND(AVG(c.calificacion), 2) AS promedio,
        fn_estatus_alumno(a.id_alumno) AS estatus
      FROM alumnos a
      JOIN inscripciones i ON a.id_alumno = i.id_alumno
      JOIN calificaciones c ON i.id_inscripcion = c.id_inscripcion
      GROUP BY a.id_alumno, a.nombre, a.apellido
      ORDER BY promedio DESC
    `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener promedios' });
    }
};

// Consulta 3: Alumnos con promedio mayor al general (subconsulta en WHERE)
export const alumnosPromedioSuperior = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT
        a.id_alumno,
        a.nombre || ' ' || a.apellido AS alumno,
        fn_promedio_alumno(a.id_alumno) AS promedio
      FROM alumnos a
      WHERE fn_promedio_alumno(a.id_alumno) > (
        SELECT AVG(calificacion) FROM calificaciones
      )
      AND EXISTS (
        SELECT 1 FROM inscripciones i
        JOIN calificaciones c ON i.id_inscripcion = c.id_inscripcion
        WHERE i.id_alumno = a.id_alumno
      )
      ORDER BY promedio DESC
    `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener alumnos con promedio superior' });
    }
};

// Consulta 4: Alumnos reprobados (promedio < 70)
export const alumnosReprobados = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT
        a.id_alumno,
        a.nombre || ' ' || a.apellido AS alumno,
        fn_promedio_alumno(a.id_alumno) AS promedio,
        fn_estatus_alumno(a.id_alumno) AS estatus
      FROM alumnos a
      WHERE fn_promedio_alumno(a.id_alumno) < 70
      AND EXISTS (
        SELECT 1 FROM inscripciones i
        JOIN calificaciones c ON i.id_inscripcion = c.id_inscripcion
        WHERE i.id_alumno = a.id_alumno
      )
      ORDER BY promedio ASC
    `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener alumnos reprobados' });
    }
};

// Consulta PLUS: Función dentro de HAVING
export const materiasMejorPromedio = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT
        m.nombre AS materia,
        ROUND(AVG(c.calificacion), 2) AS promedio_materia,
        COUNT(DISTINCT i.id_alumno) AS total_alumnos
      FROM materias m
      JOIN grupos g ON m.id_materia = g.id_materia
      JOIN inscripciones i ON g.id_grupo = i.id_grupo
      JOIN calificaciones c ON i.id_inscripcion = c.id_inscripcion
      GROUP BY m.id_materia, m.nombre
      HAVING AVG(c.calificacion) > (
        SELECT AVG(calificacion) FROM calificaciones
      )
      ORDER BY promedio_materia DESC
    `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener materias' });
    }
};

// Vista: historial
export const vistaHistorial = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM vista_historial ORDER BY alumno, materia');
        res.json(result.rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener vista historial' });
    }
};

// Vista: promedios
export const vistaPromedios = async (req, res) => {
    try {
        let query = 'SELECT * FROM vista_promedios';
        const params = [];
        
        // Si es alumno, solo ver su propio promedio
        if (req.user.role === 'alumno') {
            query += ' WHERE id_alumno = $1';
            params.push(req.user.id_alumno);
        }
        
        query += ' ORDER BY promedio DESC';
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener vista promedios' });
    }
};

// Dashboard stats
export const dashboardStats = async (req, res) => {
    try {
        const [alumnos, docentes, materias, grupos, inscripciones] = await Promise.all([
            pool.query('SELECT COUNT(*) AS count FROM alumnos'),
            pool.query('SELECT COUNT(*) AS count FROM docentes'),
            pool.query('SELECT COUNT(*) AS count FROM materias'),
            pool.query('SELECT COUNT(*) AS count FROM grupos'),
            pool.query('SELECT COUNT(*) AS count FROM inscripciones'),
        ]);

        res.json({
            alumnos: parseInt(alumnos.rows[0].count),
            docentes: parseInt(docentes.rows[0].count),
            materias: parseInt(materias.rows[0].count),
            grupos: parseInt(grupos.rows[0].count),
            inscripciones: parseInt(inscripciones.rows[0].count),
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
};
