import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, LogIn } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login(username, password);
            const routes = { admin: '/admin', docente: '/docente', alumno: '/alumno' };
            navigate(routes[user.role] || '/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    const demoUsers = [
        { username: 'admin', password: 'admin123', role: 'Admin', color: 'from-primary-500 to-primary-700' },
        { username: 'docente1', password: 'docente123', role: 'Docente', color: 'from-accent-500 to-accent-700' },
        { username: 'alumno1', password: 'alumno123', role: 'Alumno', color: 'from-success-500 to-emerald-700' },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-500/25" style={{ animation: 'pulse-glow 3s infinite' }}>
                        <Shield size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-surface-100">Sistema Académico</h1>
                    <p className="text-surface-700 text-sm mt-1">Universidad Politécnica de Querétaro</p>
                </div>

                {/* Login Form */}
                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-500 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-surface-200 uppercase tracking-wide mb-2">Usuario</label>
                            <input
                                id="login-username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Ingresa tu usuario"
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-surface-200 uppercase tracking-wide mb-2">Contraseña</label>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Ingresa tu contraseña"
                                    className="input-field pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-700 hover:text-surface-200 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center py-3 text-base disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    Iniciar Sesión
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Demo Credentials */}
                <div className="mt-6 glass-card p-5">
                    <p className="text-xs font-semibold text-surface-700 uppercase tracking-wide mb-3 text-center">Credenciales de prueba</p>
                    <div className="space-y-2">
                        {demoUsers.map((u) => (
                            <button
                                key={u.username}
                                onClick={() => { setUsername(u.username); setPassword(u.password); }}
                                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-800/50 transition-all group"
                            >
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${u.color} flex items-center justify-center text-white text-xs font-bold`}>
                                    {u.role[0]}
                                </div>
                                <div className="text-left flex-1">
                                    <p className="text-sm font-medium text-surface-200 group-hover:text-surface-100">{u.role}</p>
                                    <p className="text-xs text-surface-700">{u.username} / {u.password}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
