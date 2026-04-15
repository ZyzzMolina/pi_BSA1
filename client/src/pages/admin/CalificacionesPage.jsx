import { useState, useEffect } from 'react';
import api from '../../api/client';
import Modal from '../../components/Modal';
import { FileText, Plus, Pencil, Trash2, Search } from 'lucide-react';

const CalificacionesPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({});

    const fetchData = async () => {
        try {
            const res = await api.get('/calificaciones');
            setData(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.put(`/calificaciones/${editing}`, form);
            } else {
                await api.post('/calificaciones', form);
            }
            setModalOpen(false); setEditing(null); setForm({});
            fetchData();
        } catch (err) { alert(err.response?.data?.error || 'Error'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar esta calificación?')) return;
        try { await api.delete(`/calificaciones/${id}`); fetchData(); }
        catch (err) { alert('Error al eliminar'); }
    };

    const filtered = data.filter((c) =>
        [c.alumno_nombre, c.materia_nombre, c.periodo_eval].some((v) =>
            String(v || '').toLowerCase().includes(search.toLowerCase())
        )
    );

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title flex items-center gap-3"><FileText size={28} className="text-primary-400" />Calificaciones</h1>
                    <p className="text-surface-700 text-sm mt-1">{data.length} registros</p>
                </div>
                <button onClick={() => { setForm({}); setEditing(null); setModalOpen(true); }} className="btn-primary"><Plus size={18} /> Nueva calificación</button>
            </div>

            <div className="relative max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-700" />
                <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr><th>ID</th><th>Alumno</th><th>Materia</th><th>Calificación</th><th>Periodo Eval</th><th>Fecha</th><th className="text-right">Acciones</th></tr>
                        </thead>
                        <tbody>
                            {filtered.map((c) => (
                                <tr key={c.id_calificacion}>
                                    <td>{c.id_calificacion}</td>
                                    <td>{c.alumno_nombre}</td>
                                    <td>{c.materia_nombre}</td>
                                    <td>
                                        {c.calificacion !== null ? (
                                            <span className={`font-bold ${parseFloat(c.calificacion) >= 70 ? 'text-success-500' : 'text-danger-500'}`}>
                                                {c.calificacion}
                                            </span>
                                        ) : <span className="text-surface-700">Pendiente</span>}
                                    </td>
                                    <td><span className="badge badge-info">{c.periodo_eval}</span></td>
                                    <td>{c.fecha_registro || '—'}</td>
                                    <td className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => { setForm(c); setEditing(c.id_calificacion); setModalOpen(true); }} className="btn-secondary !p-2 !rounded-lg"><Pencil size={14} /></button>
                                            <button onClick={() => handleDelete(c.id_calificacion)} className="btn-danger !p-2 !rounded-lg"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && <tr><td colSpan={7} className="text-center text-surface-700 py-8">Sin registros</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Editar Calificación' : 'Nueva Calificación'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!editing && (
                        <div>
                            <label className="block text-xs font-semibold text-surface-200 uppercase tracking-wide mb-1.5">ID Inscripción</label>
                            <input type="number" value={form.id_inscripcion || ''} onChange={(e) => setForm({ ...form, id_inscripcion: e.target.value })} className="input-field" required placeholder="ID de inscripción" />
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-semibold text-surface-200 uppercase tracking-wide mb-1.5">Calificación (0-100)</label>
                        <input type="number" min="0" max="100" step="0.01" value={form.calificacion || ''} onChange={(e) => setForm({ ...form, calificacion: e.target.value })} className="input-field" required />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-surface-200 uppercase tracking-wide mb-1.5">Periodo de Evaluación</label>
                        <select value={form.periodo_eval || ''} onChange={(e) => setForm({ ...form, periodo_eval: e.target.value })} className="input-field" required>
                            <option value="">Seleccionar...</option>
                            <option value="Parcial 1">Parcial 1</option>
                            <option value="Parcial 2">Parcial 2</option>
                            <option value="Parcial 3">Parcial 3</option>
                            <option value="Final">Final</option>
                        </select>
                    </div>
                    {editing && (
                        <div>
                            <label className="block text-xs font-semibold text-surface-200 uppercase tracking-wide mb-1.5">Observaciones</label>
                            <input type="text" value={form.observaciones || ''} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} className="input-field" />
                        </div>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => { setModalOpen(false); setEditing(null); }} className="btn-secondary">Cancelar</button>
                        <button type="submit" className="btn-primary">{editing ? 'Guardar' : 'Registrar'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CalificacionesPage;
