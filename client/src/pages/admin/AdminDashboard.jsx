import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Users, GraduationCap, BookOpen, Layers, ClipboardList, TrendingUp, AlertTriangle, Award } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [promedios, setPromedios] = useState([]);
    const [reprobados, setReprobados] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, promRes, repRes] = await Promise.all([
                    api.get('/consultas/stats'),
                    api.get('/consultas/vista-promedios'),
                    api.get('/consultas/reprobados'),
                ]);
                setStats(statsRes.data);
                setPromedios(promRes.data.slice(0, 10));
                setReprobados(repRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const statCards = [
        { label: 'Alumnos', value: stats?.alumnos, icon: Users, gradient: 'from-primary-500 to-primary-700' },
        { label: 'Docentes', value: stats?.docentes, icon: GraduationCap, gradient: 'from-accent-500 to-accent-700' },
        { label: 'Materias', value: stats?.materias, icon: BookOpen, gradient: 'from-emerald-500 to-emerald-700' },
        { label: 'Grupos', value: stats?.grupos, icon: Layers, gradient: 'from-amber-500 to-amber-700' },
        { label: 'Inscripciones', value: stats?.inscripciones, icon: ClipboardList, gradient: 'from-rose-500 to-rose-700' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="page-title">Panel de Administración</h1>
                <p className="text-surface-700 text-sm mt-1">Resumen general del sistema académico</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {statCards.map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-lg`}>
                                <s.icon size={20} className="text-white" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-surface-100">{s.value ?? '—'}</p>
                        <p className="text-xs text-surface-700 mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Promedios */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Award size={18} className="text-primary-400" />
                        <h2 className="font-bold text-surface-100">Top 10 Promedios</h2>
                    </div>
                    <div className="space-y-3">
                        {promedios.map((p, i) => (
                            <div key={p.id_alumno} className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-xs font-bold text-white">
                                    {i + 1}
                                </span>
                                <span className="flex-1 text-sm text-surface-200 truncate">{p.alumno}</span>
                                <span className={`font-bold text-sm ${parseFloat(p.promedio) >= 70 ? 'text-success-500' : 'text-danger-500'}`}>
                                    {p.promedio}
                                </span>
                            </div>
                        ))}
                        {promedios.length === 0 && <p className="text-surface-700 text-sm">Sin datos</p>}
                    </div>
                </div>

                {/* Reprobados */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle size={18} className="text-danger-500" />
                        <h2 className="font-bold text-surface-100">Alumnos en Riesgo</h2>
                        <span className="badge badge-danger ml-auto">{reprobados.length}</span>
                    </div>
                    <div className="space-y-3">
                        {reprobados.map((r) => (
                            <div key={r.id_alumno} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-800/30 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-danger-500/15 flex items-center justify-center">
                                    <TrendingUp size={14} className="text-danger-500 rotate-180" />
                                </div>
                                <span className="flex-1 text-sm text-surface-200">{r.alumno}</span>
                                <span className="badge badge-danger">{r.promedio}</span>
                            </div>
                        ))}
                        {reprobados.length === 0 && <p className="text-surface-700 text-sm">Todos los alumnos aprobados 🎉</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
