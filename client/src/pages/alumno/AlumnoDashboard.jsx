import { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { User, FileText, BarChart3, TrendingUp, BookOpen, Award } from 'lucide-react';

const AlumnoDashboard = () => {
    const { user } = useAuth();
    const [historial, setHistorial] = useState([]);
    const [promedio, setPromedio] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [histRes, promRes] = await Promise.all([
                    api.get(`/consultas/historial/${user.id_alumno}`),
                    api.get('/consultas/vista-promedios'),
                ]);
                setHistorial(histRes.data);
                const myProm = promRes.data.find((p) => p.id_alumno === user.id_alumno);
                setPromedio(myProm);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        if (user?.id_alumno) fetchData();
    }, [user]);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

    const estatus = promedio && parseFloat(promedio.promedio) >= 70 ? 'Aprobado' : 'Reprobado';

    return (
        <div className="space-y-8">
            <div>
                <h1 className="page-title">Mi Panel</h1>
                <p className="text-surface-700 text-sm mt-1">Bienvenido, {user?.nombre} {user?.apellido}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="stat-card">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                            <BarChart3 size={20} className="text-white" />
                        </div>
                        <span className="text-xs text-surface-700 uppercase tracking-wide">Promedio General</span>
                    </div>
                    <p className={`text-3xl font-bold ${promedio && parseFloat(promedio.promedio) >= 70 ? 'text-success-500' : 'text-danger-500'}`}>
                        {promedio?.promedio ?? '—'}
                    </p>
                </div>

                <div className="stat-card">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center">
                            <Award size={20} className="text-white" />
                        </div>
                        <span className="text-xs text-surface-700 uppercase tracking-wide">Estatus</span>
                    </div>
                    <span className={`badge text-base ${estatus === 'Aprobado' ? 'badge-success' : 'badge-danger'}`}>{estatus}</span>
                </div>

                <div className="stat-card">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                            <BookOpen size={20} className="text-white" />
                        </div>
                        <span className="text-xs text-surface-700 uppercase tracking-wide">Calificaciones</span>
                    </div>
                    <p className="text-3xl font-bold text-surface-100">{promedio?.total_calificaciones ?? 0}</p>
                </div>
            </div>

            {/* Historial */}
            <div>
                <h2 className="text-lg font-bold text-surface-100 mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-primary-400" /> Mi Historial Académico
                </h2>
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr><th>Materia</th><th>Clave</th><th>Periodo</th><th>Evaluación</th><th>Calificación</th><th>Estatus</th></tr>
                            </thead>
                            <tbody>
                                {historial.map((h, i) => (
                                    <tr key={i}>
                                        <td className="font-medium text-surface-100">{h.materia}</td>
                                        <td><span className="badge badge-info">{h.clave}</span></td>
                                        <td><span className="badge badge-warning">{h.periodo}</span></td>
                                        <td>{h.periodo_eval || '—'}</td>
                                        <td>
                                            {h.calificacion !== null ? (
                                                <span className={`font-bold ${parseFloat(h.calificacion) >= 70 ? 'text-success-500' : 'text-danger-500'}`}>{h.calificacion}</span>
                                            ) : <span className="text-surface-700">Pendiente</span>}
                                        </td>
                                        <td>
                                            <span className={`badge ${h.estatus === 'Aprobado' ? 'badge-success' : 'badge-danger'}`}>{h.estatus}</span>
                                        </td>
                                    </tr>
                                ))}
                                {historial.length === 0 && <tr><td colSpan={6} className="text-center text-surface-700 py-8">Sin historial</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlumnoDashboard;
