import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../middleware/auth.js';

// Usuarios del sistema (en producción estarían en BD)
// Passwords hasheados con bcrypt
const systemUsers = [];

// Inicializar usuarios al arrancar
const initUsers = async () => {
    const salt = await bcrypt.genSalt(10);
    systemUsers.push(
        {
            id: 1,
            username: 'admin',
            password: await bcrypt.hash('admin123', salt),
            role: 'admin',
            nombre: 'Administrador',
            apellido: 'Sistema',
        },
        {
            id: 2,
            username: 'docente1',
            password: await bcrypt.hash('docente123', salt),
            role: 'docente',
            nombre: 'Dr. Ricardo',
            apellido: 'Vega',
            id_docente: 1,
        },
        {
            id: 3,
            username: 'docente2',
            password: await bcrypt.hash('docente123', salt),
            role: 'docente',
            nombre: 'Dra. Patricia',
            apellido: 'Luna',
            id_docente: 2,
        },
        {
            id: 4,
            username: 'alumno1',
            password: await bcrypt.hash('alumno123', salt),
            role: 'alumno',
            nombre: 'Carlos',
            apellido: 'Hernández',
            id_alumno: 1,
        },
        {
            id: 5,
            username: 'alumno2',
            password: await bcrypt.hash('alumno123', salt),
            role: 'alumno',
            nombre: 'María',
            apellido: 'López',
            id_alumno: 2,
        }
    );
};

initUsers();

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
        }

        const user = systemUsers.find((u) => u.username === username);
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const tokenPayload = {
            id: user.id,
            username: user.username,
            role: user.role,
            nombre: user.nombre,
            apellido: user.apellido,
        };

        if (user.id_alumno) tokenPayload.id_alumno = user.id_alumno;
        if (user.id_docente) tokenPayload.id_docente = user.id_docente;

        const token = generateToken(tokenPayload);

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                nombre: user.nombre,
                apellido: user.apellido,
                id_alumno: user.id_alumno || null,
                id_docente: user.id_docente || null,
            },
        });
    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const getProfile = async (req, res) => {
    try {
        const { role, id_alumno, id_docente } = req.user;

        let profileData = { ...req.user };

        if (role === 'alumno' && id_alumno) {
            const result = await pool.query('SELECT * FROM alumnos WHERE id_alumno = $1', [id_alumno]);
            if (result.rows.length > 0) {
                profileData.perfil = result.rows[0];
            }
        } else if (role === 'docente' && id_docente) {
            const result = await pool.query('SELECT * FROM docentes WHERE id_docente = $1', [id_docente]);
            if (result.rows.length > 0) {
                profileData.perfil = result.rows[0];
            }
        }

        res.json(profileData);
    } catch (err) {
        console.error('Error en getProfile:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
