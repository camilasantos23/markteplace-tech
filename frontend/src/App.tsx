import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store';
import { loginThunk, restaurarSessaoThunk, logout } from './store/slices/authSlice';

import Cadastro from './pages/Cadastro';
import Perfil from './pages/Perfil';
import PerfilEditar from './pages/PerfilEditar';
import PerfilPublico from './pages/PerfilPublico';
import Vendas from './pages/Vendas';
import Doacoes from './pages/Doacoes';

function LoginView() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token) navigate('/perfil');
  }, [token, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const resultAction = await dispatch(loginThunk({ email, senha }));
    if (loginThunk.fulfilled.match(resultAction)) {
      navigate('/perfil');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '350px', margin: '40px auto' }}>
      <h1>Marketplace IFPB</h1>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h2>Login de Estudante</h2>
        {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
        <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '10px' }} />
        <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required style={{ padding: '10px' }} />
        <button type="submit" disabled={loading} style={{ padding: '10px', cursor: 'pointer' }}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
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
    <div style={{ fontFamily: 'sans-serif' }}>
      {token && (
        <nav style={{ padding: '15px', background: '#f0f0f0', display: 'flex', gap: '15px', alignItems: 'center' }}>
          <strong>Marketplace IFPB</strong>
          <Link to="/vendas">Vendas</Link>
          <Link to="/doacoes">Doações</Link>
          <Link to="/perfil">Meu Perfil</Link>
          <button onClick={() => dispatch(logout())} style={{ marginLeft: 'auto', cursor: 'pointer' }}>
            Sair
          </button>
        </nav>
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