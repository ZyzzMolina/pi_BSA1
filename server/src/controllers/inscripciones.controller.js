import pool from '../config/db.js';

export const getAll = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT i.*, 
             a.nombre || ' ' || a.apellido AS alumno_nombre,
             m.nombre AS materia_nombre, m.clave,
             g.periodo, g.horario
      FROM inscripciones i
      JOIN alumnos a ON i.id_alumno = a.id_alumno
      JOIN grupos g ON i.id_grupo = g.id_grupo
      JOIN materias m ON g.id_materia = m.id_materia
      ORDER BY i.id_inscripcion
    `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener inscripciones' });
    }
};

export const getByAlumno = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
      SELECT i.*,
             m.nombre AS materia_nombre, m.clave,
             g.periodo, g.horario, g.aula,
             d.nombre || ' ' || d.apellido AS docente_nombre
      FROM inscripciones i
      JOIN grupos g ON i.id_grupo = g.id_grupo
      JOIN materias m ON g.id_materia = m.id_materia
      JOIN docentes d ON g.id_docente = d.id_docente
      WHERE i.id_alumno = $1
      ORDER BY g.periodo DESC, m.nombre
    `, [id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener inscripciones del alumno' });
    }
};

export const create = async (req, res) => {
    try {
        const { id_alumno, id_grupo } = req.body;
        // Usar el procedimiento de inscripción con transacción
        await pool.query('CALL sp_inscribir_alumno($1, $2)', [id_alumno, id_grupo]);

        const result = await pool.query(
            'SELECT * FROM inscripciones WHERE id_alumno = $1 AND id_grupo = $2',
            [id_alumno, id_grupo]
        );

        res.status(201).json({
            message: 'Inscripción exitosa',
            inscripcion: result.rows[0],
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(400).json({ error: err.message || 'Error al crear inscripción' });
    }
};

export const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM inscripciones WHERE id_inscripcion = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Inscripción no encontrada' });
        res.json({ message: 'Inscripción eliminada correctamente' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al eliminar inscripción' });
    }
};

export const getAlumnosByGrupo = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
      SELECT a.id_alumno, a.nombre, a.apellido, a.email, i.id_inscripcion, i.estado, i.fecha
      FROM inscripciones i
      JOIN alumnos a ON i.id_alumno = a.id_alumno
      WHERE i.id_grupo = $1
      ORDER BY a.apellido, a.nombre
    `, [id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener alumnos del grupo' });
    }
};
