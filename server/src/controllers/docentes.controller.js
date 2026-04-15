import pool from '../config/db.js';

export const getAll = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM docentes ORDER BY id_docente');
        res.json(result.rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener docentes' });
    }
};

export const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM docentes WHERE id_docente = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Docente no encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener docente' });
    }
};

export const create = async (req, res) => {
    try {
        const { nombre, apellido, email, telefono, especialidad } = req.body;
        const result = await pool.query(
            'INSERT INTO docentes (nombre, apellido, email, telefono, especialidad) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nombre, apellido, email, telefono, especialidad]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error:', err);
        if (err.code === '23505') return res.status(400).json({ error: 'El email ya está registrado' });
        res.status(500).json({ error: 'Error al crear docente' });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, email, telefono, especialidad } = req.body;
        const result = await pool.query(
            'UPDATE docentes SET nombre=$1, apellido=$2, email=$3, telefono=$4, especialidad=$5 WHERE id_docente=$6 RETURNING *',
            [nombre, apellido, email, telefono, especialidad, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Docente no encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error:', err);
        if (err.code === '23505') return res.status(400).json({ error: 'El email ya está registrado' });
        res.status(500).json({ error: 'Error al actualizar docente' });
    }
};

export const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM docentes WHERE id_docente = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Docente no encontrado' });
        res.json({ message: 'Docente eliminado correctamente' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al eliminar docente' });
    }
};
