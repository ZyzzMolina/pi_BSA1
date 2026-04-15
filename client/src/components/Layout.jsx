import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, GraduationCap, BookOpen, Layers,
    ClipboardList, FileText, BarChart3, LogOut, Menu, X, Shield
} from 'lucide-react';
import { useState } from 'react';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const adminLinks = [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/admin/alumnos', icon: Users, label: 'Alumnos' },
        { to: '/admin/docentes', icon: GraduationCap, label: 'Docentes' },
        { to: '/admin/materias', icon: BookOpen, label: 'Materias' },
        { to: '/admin/grupos', icon: Layers, label: 'Grupos' },
        { to: '/admin/inscripciones', icon: ClipboardList, label: 'Inscripciones' },
        { to: '/admin/calificaciones', icon: FileText, label: 'Calificaciones' },
        { to: '/admin/consultas', icon: BarChart3, label: 'Consultas' },
    ];

    const docenteLinks = [
        { to: '/docente', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/docente/grupos', icon: Layers, label: 'Mis Grupos' },
        { to: '/docente/calificaciones', icon: FileText, label: 'Calificaciones' },
    ];

    const alumnoLinks = [
        { to: '/alumno', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/alumno/historial', icon: FileText, label: 'Historial' },
        { to: '/alumno/promedios', icon: BarChart3, label: 'Promedios' },
    ];

    const links = user?.role === 'admin' ? adminLinks : user?.role === 'docente' ? docenteLinks : alumnoLinks;

    const roleLabel = { admin: 'Administrador', docente: 'Docente', alumno: 'Alumno' };
    const roleColor = { admin: 'text-primary-400', docente: 'text-accent-400', alumno: 'text-success-500' };

    return (
        <div className="flex min-h-screen">
            {/* Mobile menu button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-surface-800/80 backdrop-blur-sm border border-primary-500/10 lg:hidden"
            >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar */}
            <aside className={`
        fixed lg:sticky top-0 left-0 z-40 h-screen w-64 flex flex-col
        bg-surface-950/90 backdrop-blur-xl border-r border-primary-500/10
        transition-transform lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                {/* Logo */}
                <div className="p-6 border-b border-primary-500/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <Shield size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-surface-100 text-sm leading-tight">Sistema</h1>
                            <h1 className="font-bold text-primary-400 text-sm leading-tight">Académico</h1>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <link.icon size={18} />
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-primary-500/10">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white font-bold text-sm">
                            {user?.nombre?.[0]}{user?.apellido?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-surface-100 truncate">{user?.nombre} {user?.apellido}</p>
                            <p className={`text-xs font-medium ${roleColor[user?.role]}`}>{roleLabel[user?.role]}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="sidebar-link w-full text-danger-500 hover:bg-danger-500/10">
                        <LogOut size={18} />
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Main content */}
            <main className="flex-1 lg:p-8 p-4 pt-16 lg:pt-8 overflow-x-hidden">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
