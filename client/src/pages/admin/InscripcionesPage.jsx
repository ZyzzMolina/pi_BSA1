import { useState, useEffect } from 'react';
import api from '../../api/client';
import Modal from '../../components/Modal';
import { ClipboardList, Plus, Trash2, Search } from 'lucide-react';

const InscripcionesPage = () => {
    const [data, setData] = useState([]);
    const [alumnos, setAlumnos] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({});

    const fetchData = async () => {
        try {
            const [i, a, g] = await Promise.all([
                api.get('/inscripciones'), api.get('/alumnos'), api.get('/grupos'),
            ]);
            setData(i.data); setAlumnos(a.data); setGrupos(g.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/inscripciones', form);
            setModalOpen(false); setForm({}); fetchData();
        } catch (err) { alert(err.response?.data?.error || 'Error'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar esta inscripción?')) return;
        try { await api.delete(`/inscripciones/${id}`); fetchData(); }
        catch (err) { alert('Error al eliminar'); }
    };

    const filtered = data.filter((i) =>
        [i.alumno_nombre, i.materia_nombre, i.periodo].some((v) =>
            String(v || '').toLowerCase().includes(search.toLowerCase())
        )
    );

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title flex items-center gap-3"><ClipboardList size={28} className="text-primary-400" />Inscripciones</h1>
                    <p className="text-surface-700 text-sm mt-1">{data.length} registros</p>
                </div>
                <button onClick={() => { setForm({}); setModalOpen(true); }} className="btn-primary"><Plus size={18} /> Nueva inscripción</button>
            </div>

            <div className="relative max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-700" />
                <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr><th>ID</th><th>Alumno</th><th>Materia</th><th>Periodo</th><th>Fecha</th><th>Estado</th><th className="text-right">Acciones</th></tr>
                        </thead>
                        <tbody>
                            {filtered.map((i) => (
                                <tr key={i.id_inscripcion}>
                                    <td>{i.id_inscripcion}</td>
                                    <td>{i.alumno_nombre}</td>
                                    <td><span className="badge badge-info">{i.clave}</span> {i.materia_nombre}</td>
                                    <td><span className="badge badge-warning">{i.periodo}</span></td>
                                    <td>{i.fecha}</td>
                                    <td><span className="badge badge-success">{i.estado}</span></td>
                                    <td className="text-right">
                                        <button onClick={() => handleDelete(i.id_inscripcion)} className="btn-danger !p-2 !rounded-lg"><Trash2 size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && <tr><td colSpan={7} className="text-center text-surface-700 py-8">Sin registros</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Inscripción">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-surface-200 uppercase tracking-wide mb-1.5">Alumno</label>
                        <select value={form.id_alumno || ''} onChange={(e) => setForm({ ...form, id_alumno: e.target.value })} className="input-field" required>
                            <option value="">Seleccionar...</option>
                            {alumnos.map((a) => <option key={a.id_alumno} value={a.id_alumno}>{a.nombre} {a.apellido}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-surface-200 uppercase tracking-wide mb-1.5">Grupo</label>
                        <select value={form.id_grupo || ''} onChange={(e) => setForm({ ...form, id_grupo: e.target.value })} className="input-field" required>
                            <option value="">Seleccionar...</option>
                            {grupos.map((g) => <option key={g.id_grupo} value={g.id_grupo}>{g.clave || g.materia_nombre} — {g.docente_nombre} ({g.periodo})</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
                        <button type="submit" className="btn-primary">Inscribir</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default InscripcionesPage;
