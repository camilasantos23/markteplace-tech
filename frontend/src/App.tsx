import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store';
import { loginThunk, restaurarSessaoThunk, logout } from './store/slices/authSlice';

import Cadastro from './pages/Cadastro';
import Perfil from './pages/Perfil';
import PerfilEditar from './pages/PerfilEditar';
import PerfilPublico from './pages/PerfilPublico';
import Vendas from './pages/Vendas';
import Doacoes from './pages/Doacoes';
import Cadastro from './pages/Cadastro';
import './styles/techmarket.css';

function LoginView() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, token } = useAppSelector((state) => state.auth);

  useEffect(() => { if (token) navigate('/vendas'); }, [token, navigate]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const action = await dispatch(loginThunk({ email, senha }));
    if (loginThunk.fulfilled.match(action)) navigate('/vendas');
  };
  return (
    <main className="auth-layout">
      <aside className="auth-brand">
        <Link className="brand auth-brand-logo" to="/login"><span className="brand-mark">▥</span><span>TechMarket<small>IFPB · Cajazeiras</small></span></Link>
        <div className="auth-brand-copy"><span className="auth-kicker">FEITO NO IFPB, PARA O IFPB</span><h1>Tecnologia circulando entre quem faz acontecer.</h1><p>Compre, doe e negocie equipamentos com estudantes do seu campus.</p></div>
        <span className="auth-foot">IFPB Campus Cajazeiras · Projeto acadêmico</span>
      </aside>
      <section className="auth-panel"><div className="auth-form-wrap"><span className="form-eyebrow">BEM-VINDO DE VOLTA</span><h2>Entre na sua conta</h2><p className="form-description">Acesse o marketplace da comunidade acadêmica.</p>
        <form onSubmit={handleLogin} className="auth-form"><label>E-mail institucional<input type="email" placeholder="seu.nome@academico.ifpb.edu.br" value={email} onChange={e => setEmail(e.target.value)} required /></label><label>Senha<input type="password" placeholder="Digite sua senha" value={senha} onChange={e => setSenha(e.target.value)} required /></label>{error && <p className="form-error" role="alert">{error}</p>}<button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar na plataforma →'}</button></form>
        <p className="auth-bottom">Novo por aqui? <Link to="/cadastro">Criar uma conta</Link></p>
      </div></section>
    </main>
  );
}

function RotaProtegida({ children }: { children: React.ReactNode }) {
  const { token } = useAppSelector((state) => state.auth);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const dispatch = useAppDispatch();
  const { usuario, token } = useAppSelector((state) => state.auth);
  const [tentouRestaurar, setTentouRestaurar] = useState(false);

  useEffect(() => {
    if (token && !usuario && !tentouRestaurar) {
      setTentouRestaurar(true);
      dispatch(restaurarSessaoThunk());
    }
  }, [dispatch, token, usuario, tentouRestaurar]);

  return (
    <div className="app-shell">
      {token && (
        <header className="site-header"><nav className="site-nav" aria-label="Navegação principal"><Link className="brand" to="/vendas"><span className="brand-mark">▥</span><span>TechMarket<small>IFPB · Cajazeiras</small></span></Link><div className="nav-links"><NavLink to="/vendas" className={({isActive}) => isActive ? 'nav-active' : ''}>Explorar vendas</NavLink><NavLink to="/doacoes" className={({isActive}) => isActive ? 'nav-active' : ''}>Doações</NavLink><NavLink to="/perfil" className={({isActive}) => isActive ? 'nav-active' : ''}>Meu perfil</NavLink></div><button className="logout-button" onClick={() => dispatch(logout())}>Sair</button></nav></header>
      )}

      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/vendas" element={<RotaProtegida><Vendas /></RotaProtegida>} />
        <Route path="/doacoes" element={<RotaProtegida><Doacoes /></RotaProtegida>} />
        <Route path="/" element={<Navigate to={token ? "/vendas" : "/login"} replace />} />
        <Route path="/perfil" element={<RotaProtegida><Perfil /></RotaProtegida>} />
        <Route path="/perfil/editar" element={<RotaProtegida><PerfilEditar /></RotaProtegida>} />
        <Route path="/usuarios/:id" element={<RotaProtegida><PerfilPublico /></RotaProtegida>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}