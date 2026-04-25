import { useState, useEffect } from 'react';
import api from '../../api/client';
import Modal from '../../components/Modal';
import { Lock, Plus, Pencil, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';

const PeriodosDocentePage = () => {
    const [data, setData] = useState([]);
    const [docentes, setDocentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({});

    const fetchData = async () => {
        try {
            const [periodosRes, docentesRes] = await Promise.all([
                api.get('/periodos-docente'),
                api.get('/docentes')
            ]);
            setData(periodosRes.data);
            setDocentes(docentesRes.data);
        } catch (err) { 
            console.error(err); 
        }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.put(`/periodos-docente/${editing}`, form);
            } else {
                await api.post('/periodos-docente', form);
            }
            setModalOpen(false); 
            setEditing(null); 
            setForm({});
            fetchData();
        } catch (err) { alert(err.response?.data?.error || 'Error'); }
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            await api.put(`/periodos-docente/${id}`, { activo: !currentStatus });
            fetchData();
        } catch (err) { alert('Error al actualizar estado'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar este período?')) return;
        try { 
            await api.delete(`/periodos-docente/${id}`); 
            fetchData(); 
        }
        catch (err) { alert('Error al eliminar'); }
    };

    const filtered = data.filter((p) =>
        [p.docente_nombre, p.periodo].some((v) =>
            String(v || '').toLowerCase().includes(search.toLowerCase())
        )
    );

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title flex items-center gap-3"><Lock size={28} className="text-primary-400" />Períodos de Docentes</h1>
                    <p className="text-surface-700 text-sm mt-1">{data.length} períodos configurados</p>
                </div>
                <button onClick={() => { setForm({}); setEditing(null); setModalOpen(true); }} className="btn-primary"><Plus size={18} /> Nuevo Período</button>
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
                                <th>Docente</th>
                                <th>Período</th>
                                <th>Estado</th>
                                <th>Activado el</th>
                                <th className="text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p) => (
                                <tr key={p.id_periodo_docente}>
                                    <td>{p.docente_nombre}</td>
                                    <td><span className="badge badge-warning">{p.periodo}</span></td>
                                    <td>
                                        <button 
                                            onClick={() => handleToggleActive(p.id_periodo_docente, p.activo)}
                                            className={`flex items-center gap-1 cursor-pointer ${p.activo ? 'text-success-500' : 'text-surface-600'}`}
                                        >
                                            {p.activo ? (
                                                <>
                                                    <CheckCircle size={16} />
                                                    <span className="text-xs">Activo</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle size={16} />
                                                    <span className="text-xs">Inactivo</span>
                                                </>
                                            )}
                                        </button>
                                    </td>
                                    <td className="text-xs text-surface-600">{new Date(p.fecha_activacion).toLocaleDateString()}</td>
                                    <td className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => { setForm(p); setEditing(p.id_periodo_docente); setModalOpen(true); }} className="btn-secondary !p-2 !rounded-lg"><Pencil size={14} /></button>
                                            <button onClick={() => handleDelete(p.id_periodo_docente)} className="btn-danger !p-2 !rounded-lg"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && <tr><td colSpan={5} className="text-center text-surface-700 py-8">Sin registros</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Período' : 'Crear Nuevo Período'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-surface-200 uppercase tracking-wide mb-1.5">Docente</label>
                        <select 
                            value={form.id_docente || ''} 
                            onChange={(e) => setForm({ ...form, id_docente: parseInt(e.target.value) })}
                            className="input-field"
                            disabled={!!editing}
                            required
                        >
                            <option value="">Selecciona un docente</option>
                            {docentes.map((d) => (
                                <option key={d.id_docente} value={d.id_docente}>
                                    {d.nombre} {d.apellido}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-surface-200 uppercase tracking-wide mb-1.5">Período</label>
                        <input 
                            type="text" 
                            placeholder="Ej: Parcial 1, Parcial 2, Final"
                            value={form.periodo || ''} 
                            onChange={(e) => setForm({ ...form, periodo: e.target.value })}
                            className="input-field"
                            disabled={!!editing}
                            required 
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
                        <button type="submit" className="btn-primary">{editing ? 'Actualizar' : 'Crear'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default PeriodosDocentePage;
