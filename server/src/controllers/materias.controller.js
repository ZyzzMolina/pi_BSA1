import pool from '../config/db.js';

export const getAll = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM materias ORDER BY id_materia');
        res.json(result.rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener materias' });
    }
};

export const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM materias WHERE id_materia = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Materia no encontrada' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener materia' });
    }
};

export const create = async (req, res) => {
    try {
        const { nombre, clave, creditos, descripcion } = req.body;
        const result = await pool.query(
            'INSERT INTO materias (nombre, clave, creditos, descripcion) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, clave, creditos, descripcion]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error:', err);
        if (err.code === '23505') return res.status(400).json({ error: 'La clave ya está registrada' });
        res.status(500).json({ error: 'Error al crear materia' });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, clave, creditos, descripcion } = req.body;
        const result = await pool.query(
            'UPDATE materias SET nombre=$1, clave=$2, creditos=$3, descripcion=$4 WHERE id_materia=$5 RETURNING *',
            [nombre, clave, creditos, descripcion, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Materia no encontrada' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error:', err);
        if (err.code === '23505') return res.status(400).json({ error: 'La clave ya está registrada' });
        res.status(500).json({ error: 'Error al actualizar materia' });
    }
};

export const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM materias WHERE id_materia = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Materia no encontrada' });
        res.json({ message: 'Materia eliminada correctamente' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al eliminar materia' });
    }
};
