import pool from '../config/db.js';

export const getAll = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT g.*, m.nombre AS materia_nombre, m.clave,
             d.nombre || ' ' || d.apellido AS docente_nombre
      FROM grupos g
      JOIN materias m ON g.id_materia = m.id_materia
      JOIN docentes d ON g.id_docente = d.id_docente
      ORDER BY g.id_grupo
    `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener grupos' });
    }
};

export const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
      SELECT g.*, m.nombre AS materia_nombre, m.clave,
             d.nombre || ' ' || d.apellido AS docente_nombre
      FROM grupos g
      JOIN materias m ON g.id_materia = m.id_materia
      JOIN docentes d ON g.id_docente = d.id_docente
      WHERE g.id_grupo = $1
    `, [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Grupo no encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener grupo' });
    }
};

export const create = async (req, res) => {
    try {
        const { id_materia, id_docente, periodo, horario, aula } = req.body;
        const result = await pool.query(
            'INSERT INTO grupos (id_materia, id_docente, periodo, horario, aula) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [id_materia, id_docente, periodo, horario, aula]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al crear grupo' });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_materia, id_docente, periodo, horario, aula } = req.body;
        const result = await pool.query(
            'UPDATE grupos SET id_materia=$1, id_docente=$2, periodo=$3, horario=$4, aula=$5 WHERE id_grupo=$6 RETURNING *',
            [id_materia, id_docente, periodo, horario, aula, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Grupo no encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al actualizar grupo' });
    }
};

export const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM grupos WHERE id_grupo = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Grupo no encontrado' });
        res.json({ message: 'Grupo eliminado correctamente' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al eliminar grupo' });
    }
};

export const getByDocente = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validar que el docente solo vea sus propios grupos
        if (req.user.role === 'docente' && req.user.id_docente != id) {
            return res.status(403).json({ error: 'No puedes ver los grupos de otro docente' });
        }
        
        const result = await pool.query(`
      SELECT g.*, m.nombre AS materia_nombre, m.clave
      FROM grupos g
      JOIN materias m ON g.id_materia = m.id_materia
      WHERE g.id_docente = $1
      ORDER BY g.periodo DESC, m.nombre
    `, [id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener grupos del docente' });
    }
};

export const getAlumnosByGrupo = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(`
      SELECT 
        i.id_inscripcion,
        a.id_alumno,
        a.nombre || ' ' || a.apellido AS alumno_nombre,
        i.id_grupo
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
