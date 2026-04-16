import pool from '../config/db.js';

export const getAll = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT c.*, 
             a.nombre || ' ' || a.apellido AS alumno_nombre,
             m.nombre AS materia_nombre
      FROM calificaciones c
      JOIN inscripciones i ON c.id_inscripcion = i.id_inscripcion
      JOIN alumnos a ON i.id_alumno = a.id_alumno
      JOIN grupos g ON i.id_grupo = g.id_grupo
      JOIN materias m ON g.id_materia = m.id_materia
      ORDER BY c.id_calificacion
    `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener calificaciones' });
    }
};

export const getByInscripcion = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM calificaciones WHERE id_inscripcion = $1 ORDER BY periodo_eval',
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener calificaciones' });
    }
};

export const create = async (req, res) => {
    try {
        const { id_inscripcion, calificacion, periodo_eval } = req.body;
        // Usamos el procedimiento almacenado
        await pool.query('CALL sp_registrar_calificacion($1, $2, $3)', [
            id_inscripcion, calificacion, periodo_eval,
        ]);

        const result = await pool.query(
            'SELECT * FROM calificaciones WHERE id_inscripcion = $1 ORDER BY id_calificacion DESC LIMIT 1',
            [id_inscripcion]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(400).json({ error: err.message || 'Error al registrar calificación' });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { calificacion, periodo_eval, observaciones } = req.body;
        const result = await pool.query(
            'UPDATE calificaciones SET calificacion=$1, periodo_eval=$2, observaciones=$3 WHERE id_calificacion=$4 RETURNING *',
            [calificacion, periodo_eval, observaciones, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Calificación no encontrada' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error:', err);
        // El trigger captura calificaciones fuera de rango
        res.status(400).json({ error: err.message || 'Error al actualizar calificación' });
    }
};

export const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM calificaciones WHERE id_calificacion = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Calificación no encontrada' });
        res.json({ message: 'Calificación eliminada correctamente' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al eliminar calificación' });
    }
};

export const getByGrupo = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Si es docente, validar que es el dueño del grupo
        if (req.user.role === 'docente') {
            const grupoCheck = await pool.query('SELECT id_docente FROM grupos WHERE id_grupo = $1', [id]);
            if (grupoCheck.rows.length === 0) {
                return res.status(404).json({ error: 'Grupo no encontrado' });
            }
            if (grupoCheck.rows[0].id_docente !== req.user.id_docente) {
                return res.status(403).json({ error: 'No puedes ver las calificaciones de este grupo' });
            }
        }
        
        const result = await pool.query(`
      SELECT c.*, a.id_alumno, a.nombre || ' ' || a.apellido AS alumno_nombre, i.id_inscripcion
      FROM calificaciones c
      JOIN inscripciones i ON c.id_inscripcion = i.id_inscripcion
      JOIN alumnos a ON i.id_alumno = a.id_alumno
      WHERE i.id_grupo = $1
      ORDER BY a.apellido, a.nombre, c.periodo_eval
    `, [id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener calificaciones del grupo' });
    }
};
