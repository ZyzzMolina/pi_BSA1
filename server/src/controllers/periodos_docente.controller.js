import pool from '../config/db.js';

export const getByDocente = async (req, res) => {
    try {
        const { id_docente } = req.params;
        
        const result = await pool.query(
            'SELECT * FROM periodos_docente WHERE id_docente = $1 ORDER BY fecha_activacion DESC',
            [id_docente]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener períodos del docente' });
    }
};

export const getActivosByDocente = async (req, res) => {
    try {
        const { id_docente } = req.params;
        
        const result = await pool.query(
            'SELECT * FROM periodos_docente WHERE id_docente = $1 AND activo = TRUE ORDER BY fecha_activacion DESC',
            [id_docente]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener períodos activos' });
    }
};

export const create = async (req, res) => {
    try {
        const { id_docente, periodo } = req.body;
        
        const result = await pool.query(
            'INSERT INTO periodos_docente (id_docente, periodo, activo) VALUES ($1, $2, TRUE) RETURNING *',
            [id_docente, periodo]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error:', err);
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Este período ya está asignado al docente' });
        }
        res.status(500).json({ error: 'Error al crear período para docente' });
    }
};

export const toggleActive = async (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body;
        
        const result = await pool.query(
            'UPDATE periodos_docente SET activo = $1 WHERE id_periodo_docente = $2 RETURNING *',
            [activo, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Período no encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al actualizar período' });
    }
};

export const remove = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'DELETE FROM periodos_docente WHERE id_periodo_docente = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Período no encontrado' });
        }
        
        res.json({ message: 'Período eliminado correctamente' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al eliminar período' });
    }
};

export const getAll = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT pd.*, d.nombre || ' ' || d.apellido AS docente_nombre
            FROM periodos_docente pd
            JOIN docentes d ON pd.id_docente = d.id_docente
            ORDER BY pd.fecha_activacion DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener períodos' });
    }
};
