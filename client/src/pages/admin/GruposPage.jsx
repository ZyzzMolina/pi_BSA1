import { useState, useEffect } from 'react';
import api from '../../api/client';
import Modal from '../../components/Modal';
import { Layers, Plus, Pencil, Trash2, Search } from 'lucide-react';

const GruposPage = () => {
    const [grupos, setGrupos] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [docentes, setDocentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({});

    const fetchData = async () => {
        try {
            const [g, m, d] = await Promise.all([
                api.get('/grupos'), api.get('/materias'), api.get('/docentes'),
            ]);
            setGrupos(g.data);
            setMaterias(m.data);
            setDocentes(d.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) await api.put(`/grupos/${editing}`, form);
            else await api.post('/grupos', form);
            setModalOpen(false); setEditing(null); setForm({});
            fetchData();
        } catch (err) { alert(err.response?.data?.error || 'Error'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar este grupo?')) return;
        try { await api.delete(`/grupos/${id}`); fetchData(); }
        catch (err) { alert('Error al eliminar'); }
    };

    const filtered = grupos.filter((g) =>
        [g.materia_nombre, g.docente_nombre, g.periodo, g.aula]
            .some((v) => String(v || '').toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title flex items-center gap-3"><Layers size={28} className="text-primary-400" />Grupos</h1>
                    <p className="text-surface-700 text-sm mt-1">{grupos.length} registros</p>
                </div>
                <button onClick={() => { setForm({}); setEditing(null); setModalOpen(true); }} className="btn-primary"><Plus size={18} /> Nuevo grupo</button>
            </div>

            <div className="relative max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-700" />
                <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th><th>Materia</th><th>Docente</th><th>Periodo</th><th>Horario</th><th>Aula</th><th className="text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((g) => (
                                <tr key={g.id_grupo}>
                                    <td>{g.id_grupo}</td>
                                    <td><span className="badge badge-info">{g.clave}</span> {g.materia_nombre}</td>
                                    <td>{g.docente_nombre}</td>
                                    <td><span className="badge badge-warning">{g.periodo}</span></td>
                                    <td>{g.horario || '—'}</td>
                                    <td>{g.aula || '—'}</td>
                                    <td className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => { setForm(g); setEditing(g.id_grupo); setModalOpen(true); }} className="btn-secondary !p-2 !rounded-lg"><Pencil size={14} /></button>
                                            <button onClick={() => handleDelete(g.id_grupo)} className="btn-danger !p-2 !rounded-lg"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && <tr><td colSpan={7} className="text-center text-surface-700 py-8">Sin registros</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Editar Grupo' : 'Nuevo Grupo'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-surface-200 uppercase tracking-wide mb-1.5">Materia</label>
                        <select value={form.id_materia || ''} onChange={(e) => setForm({ ...form, id_materia: e.target.value })} className="input-field" required>
                            <option value="">Seleccionar...</option>
                            {materias.map((m) => <option key={m.id_materia} value={m.id_materia}>{m.clave} — {m.nombre}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-surface-200 uppercase tracking-wide mb-1.5">Docente</label>
                        <select value={form.id_docente || ''} onChange={(e) => setForm({ ...form, id_docente: e.target.value })} className="input-field" required>
                            <option value="">Seleccionar...</option>
                            {docentes.map((d) => <option key={d.id_docente} value={d.id_docente}>{d.nombre} {d.apellido}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-surface-200 uppercase tracking-wide mb-1.5">Periodo</label>
                        <input type="text" value={form.periodo || ''} onChange={(e) => setForm({ ...form, periodo: e.target.value })} className="input-field" required placeholder="Ej: 2026-1" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-surface-200 uppercase tracking-wide mb-1.5">Horario</label>
                        <input type="text" value={form.horario || ''} onChange={(e) => setForm({ ...form, horario: e.target.value })} className="input-field" placeholder="Ej: Lun-Mié 08:00-10:00" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-surface-200 uppercase tracking-wide mb-1.5">Aula</label>
                        <input type="text" value={form.aula || ''} onChange={(e) => setForm({ ...form, aula: e.target.value })} className="input-field" placeholder="Ej: A-101" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => { setModalOpen(false); setEditing(null); }} className="btn-secondary">Cancelar</button>
                        <button type="submit" className="btn-primary">{editing ? 'Guardar' : 'Crear'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default GruposPage;
