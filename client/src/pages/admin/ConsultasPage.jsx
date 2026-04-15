import { useState, useEffect } from 'react';
import api from '../../api/client';
import { BarChart3, TrendingUp, TrendingDown, Award, BookOpen } from 'lucide-react';

const ConsultasPage = () => {
    const [activeTab, setActiveTab] = useState('promedios');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const tabs = [
        { id: 'promedios', label: 'Promedios', icon: BarChart3, endpoint: '/consultas/promedios' },
        { id: 'superior', label: 'Sobre Promedio', icon: TrendingUp, endpoint: '/consultas/promedio-superior' },
        { id: 'reprobados', label: 'Reprobados', icon: TrendingDown, endpoint: '/consultas/reprobados' },
        { id: 'materias', label: 'Materias (HAVING)', icon: BookOpen, endpoint: '/consultas/materias-mejor-promedio' },
        { id: 'historial', label: 'Vista Historial', icon: Award, endpoint: '/consultas/vista-historial' },
    ];

    const fetchTab = async (tab) => {
        setLoading(true);
        try {
            const res = await api.get(tab.endpoint);
            setData(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        const tab = tabs.find((t) => t.id === activeTab);
        if (tab) fetchTab(tab);
    }, [activeTab]);

    const renderTable = () => {
        if (data.length === 0) return <p className="text-surface-700 text-center py-8">Sin resultados</p>;
        const keys = Object.keys(data[0]);
        return (
            <div className="overflow-x-auto">
                <table className="data-table">
                    <thead>
                        <tr>{keys.map((k) => <th key={k}>{k.replace(/_/g, ' ').toUpperCase()}</th>)}</tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => (
                            <tr key={i}>
                                {keys.map((k) => (
                                    <td key={k}>
                                        {k === 'estatus' ? (
                                            <span className={`badge ${row[k] === 'Aprobado' ? 'badge-success' : 'badge-danger'}`}>{row[k]}</span>
                                        ) : k === 'promedio' || k === 'promedio_materia' ? (
                                            <span className={`font-bold ${parseFloat(row[k]) >= 70 ? 'text-success-500' : 'text-danger-500'}`}>{row[k]}</span>
                                        ) : k === 'calificacion' ? (
                                            row[k] !== null ? (
                                                <span className={`font-bold ${parseFloat(row[k]) >= 70 ? 'text-success-500' : 'text-danger-500'}`}>{row[k]}</span>
                                            ) : <span className="text-surface-700">Pendiente</span>
                                        ) : (
                                            row[k] ?? '—'
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="page-title flex items-center gap-3"><BarChart3 size={28} className="text-primary-400" />Consultas y Reportes</h1>
                <p className="text-surface-700 text-sm mt-1">Consultas obligatorias, vistas y reportes avanzados</p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-primary-600/20 to-accent-600/20 text-primary-400 border border-primary-500/20'
                                : 'bg-surface-800/30 text-surface-200 border border-transparent hover:bg-surface-800/50'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="glass-card p-1 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : renderTable()}
            </div>

            {/* Info */}
            <div className="glass-card p-5">
                <h3 className="text-sm font-bold text-surface-100 mb-2">Descripción de consultas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-surface-700">
                    <div><strong className="text-surface-200">Promedios:</strong> AVG + GROUP BY — Promedio por alumno con estatus</div>
                    <div><strong className="text-surface-200">Sobre Promedio:</strong> Subconsulta en WHERE — Alumnos arriba del promedio general</div>
                    <div><strong className="text-surface-200">Reprobados:</strong> Alumnos con promedio &lt; 70</div>
                    <div><strong className="text-surface-200">Materias (HAVING):</strong> Función dentro de HAVING — Materias con mejor promedio</div>
                    <div><strong className="text-surface-200">Vista Historial:</strong> vista_historial — Alumno, materia, calificación</div>
                </div>
            </div>
        </div>
    );
};

export default ConsultasPage;
