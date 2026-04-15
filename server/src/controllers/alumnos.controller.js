import pool from '../config/db.js';

export const getAll = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM alumnos ORDER BY id_alumno');
        res.json(result.rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener alumnos' });
    }
};

export const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM alumnos WHERE id_alumno = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Alumno no encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener alumno' });
    }
};

export const create = async (req, res) => {
    try {
        const { nombre, apellido, email, telefono, fecha_nac, direccion } = req.body;
        const result = await pool.query(
            'INSERT INTO alumnos (nombre, apellido, email, telefono, fecha_nac, direccion) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [nombre, apellido, email, telefono, fecha_nac, direccion]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error:', err);
        if (err.code === '23505') return res.status(400).json({ error: 'El email ya está registrado' });
        res.status(500).json({ error: 'Error al crear alumno' });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, email, telefono, fecha_nac, direccion } = req.body;
        const result = await pool.query(
            'UPDATE alumnos SET nombre=$1, apellido=$2, email=$3, telefono=$4, fecha_nac=$5, direccion=$6 WHERE id_alumno=$7 RETURNING *',
            [nombre, apellido, email, telefono, fecha_nac, direccion, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Alumno no encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error:', err);
        if (err.code === '23505') return res.status(400).json({ error: 'El email ya está registrado' });
        res.status(500).json({ error: 'Error al actualizar alumno' });
    }
};

export const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM alumnos WHERE id_alumno = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Alumno no encontrado' });
        res.json({ message: 'Alumno eliminado correctamente' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al eliminar alumno' });
    }
};
