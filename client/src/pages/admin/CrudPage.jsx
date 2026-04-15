import { useState, useEffect } from 'react';
import api from '../../api/client';
import Modal from '../../components/Modal';
import { Plus, Pencil, Trash2, Search, Users } from 'lucide-react';

const CrudPage = ({ title, icon: Icon, endpoint, columns, formFields, entityName }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({});

    const fetchData = async () => {
        try {
            const res = await api.get(endpoint);
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.put(`${endpoint}/${editing}`, form);
            } else {
                await api.post(endpoint, form);
            }
            setModalOpen(false);
            setEditing(null);
            setForm({});
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(`¿Eliminar este ${entityName}?`)) return;
        try {
            await api.delete(`${endpoint}/${id}`);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Error al eliminar');
        }
    };

    const openEdit = (item) => {
        setForm(item);
        setEditing(item[columns[0].key]);
        setModalOpen(true);
    };

    const openCreate = () => {
        setForm({});
        setEditing(null);
        setModalOpen(true);
    };

    const filtered = data.filter((item) =>
        columns.some((col) =>
            String(item[col.key] || '').toLowerCase().includes(search.toLowerCase())
        )
    );

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title flex items-center gap-3">
                        {Icon && <Icon size={28} className="text-primary-400" />}
                        {title}
                    </h1>
                    <p className="text-surface-700 text-sm mt-1">{data.length} registros</p>
                </div>
                <button onClick={openCreate} className="btn-primary">
                    <Plus size={18} /> Nuevo {entityName}
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-700" />
                <input
                    type="text"
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field pl-10"
                />
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                {columns.map((col) => (
                                    <th key={col.key}>{col.label}</th>
                                ))}
                                <th className="text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item) => (
                                <tr key={item[columns[0].key]}>
                                    {columns.map((col) => (
                                        <td key={col.key}>{col.render ? col.render(item[col.key], item) : item[col.key] ?? '—'}</td>
                                    ))}
                                    <td className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEdit(item)} className="btn-secondary !p-2 !rounded-lg">
                                                <Pencil size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(item[columns[0].key])} className="btn-danger !p-2 !rounded-lg">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length + 1} className="text-center text-surface-700 py-8">
                                        No se encontraron registros
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? `Editar ${entityName}` : `Nuevo ${entityName}`}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {formFields.map((f) => (
                        <div key={f.key}>
                            <label className="block text-xs font-semibold text-surface-200 uppercase tracking-wide mb-1.5">{f.label}</label>
                            {f.type === 'select' ? (
                                <select
                                    value={form[f.key] || ''}
                                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                                    className="input-field"
                                    required={f.required}
                                >
                                    <option value="">Seleccionar...</option>
                                    {(f.options || []).map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={f.type || 'text'}
                                    value={form[f.key] || ''}
                                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                                    className="input-field"
                                    required={f.required}
                                    placeholder={f.placeholder || ''}
                                />
                            )}
                        </div>
                    ))}
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => { setModalOpen(false); setEditing(null); }} className="btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            {editing ? 'Guardar cambios' : 'Crear'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CrudPage;
