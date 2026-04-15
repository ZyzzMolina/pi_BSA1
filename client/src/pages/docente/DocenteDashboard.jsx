import { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { Layers, Users, FileText, Pencil, Search } from 'lucide-react';

const DocenteDashboard = () => {
    const { user } = useAuth();
    const [grupos, setGrupos] = useState([]);
    const [selectedGrupo, setSelectedGrupo] = useState(null);
    const [calificaciones, setCalificaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editModal, setEditModal] = useState(false);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        const fetchGrupos = async () => {
            try {
                const res = await api.get(`/grupos/docente/${user.id_docente}`);
                setGrupos(res.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        if (user?.id_docente) fetchGrupos();
    }, [user]);

    const fetchCalificaciones = async (id_grupo) => {
        try {
            const res = await api.get(`/calificaciones/grupo/${id_grupo}`);
            setCalificaciones(res.data);
            setSelectedGrupo(id_grupo);
        } catch (err) { console.error(err); }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/calificaciones/${editForm.id_calificacion}`, editForm);
            setEditModal(false);
            fetchCalificaciones(selectedGrupo);
        } catch (err) { alert(err.response?.data?.error || 'Error'); }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="page-title">Panel Docente</h1>
                <p className="text-surface-700 text-sm mt-1">Bienvenido, {user?.nombre} {user?.apellido}</p>
            </div>

            {/* Mis Grupos */}
            <div>
                <h2 className="text-lg font-bold text-surface-100 mb-4 flex items-center gap-2"><Layers size={20} className="text-primary-400" /> Mis Grupos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {grupos.map((g) => (
                        <button
                            key={g.id_grupo}
                            onClick={() => fetchCalificaciones(g.id_grupo)}
                            className={`stat-card text-left cursor-pointer ${selectedGrupo === g.id_grupo ? '!border-primary-500/40 !bg-primary-500/5' : ''}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span className="badge badge-info">{g.clave}</span>
                                <span className="badge badge-warning">{g.periodo}</span>
                            </div>
                            <h3 className="font-bold text-surface-100 text-sm">{g.materia_nombre}</h3>
                            <p className="text-xs text-surface-700 mt-1">{g.horario}</p>
                        </button>
                    ))}
                    {grupos.length === 0 && <p className="text-surface-700">No tienes grupos asignados</p>}
                </div>
            </div>

            {/* Calificaciones del grupo */}
            {selectedGrupo && (
                <div>
                    <h2 className="text-lg font-bold text-surface-100 mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-primary-400" /> Calificaciones del Grupo
                    </h2>
                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr><th>Alumno</th><th>Calificación</th><th>Periodo Eval</th><th className="text-right">Acción</th></tr>
                                </thead>
                                <tbody>
                                    {calificaciones.map((c) => (
                                        <tr key={c.id_calificacion}>
                                            <td>{c.alumno_nombre}</td>
                                            <td>
                                                {c.calificacion !== null ? (
                                                    <span className={`font-bold ${parseFloat(c.calificacion) >= 70 ? 'text-success-500' : 'text-danger-500'}`}>{c.calificacion}</span>
                                                ) : <span className="text-surface-700">Pendiente</span>}
                                            </td>
                                            <td><span className="badge badge-info">{c.periodo_eval}</span></td>
                                            <td className="text-right">
                                                <button onClick={() => { setEditForm(c); setEditModal(true); }} className="btn-secondary !p-2 !rounded-lg"><Pencil size={14} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {calificaciones.length === 0 && <tr><td colSpan={4} className="text-center text-surface-700 py-8">Sin calificaciones</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Editar Calificación">
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-surface-200 uppercase tracking-wide mb-1.5">Alumno</label>
                        <p className="text-sm text-surface-100">{editForm.alumno_nombre}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-surface-200 uppercase tracking-wide mb-1.5">Calificación (0-100)</label>
                        <input type="number" min="0" max="100" step="0.01" value={editForm.calificacion || ''} onChange={(e) => setEditForm({ ...editForm, calificacion: e.target.value })} className="input-field" required />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-surface-200 uppercase tracking-wide mb-1.5">Observaciones</label>
                        <input type="text" value={editForm.observaciones || ''} onChange={(e) => setEditForm({ ...editForm, observaciones: e.target.value })} className="input-field" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setEditModal(false)} className="btn-secondary">Cancelar</button>
                        <button type="submit" className="btn-primary">Guardar</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default DocenteDashboard;
