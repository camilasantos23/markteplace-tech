import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { loginThunk } from '../store/slices/authSlice';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((s) => s.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(loginThunk({ email, senha }));
    if (loginThunk.fulfilled.match(result)) navigate('/vendas');
  };

  return (
    <div style={{ maxWidth: 360, margin: '80px auto', fontFamily: 'sans-serif' }}>
      <h1>Marketplace IFPB</h1>
      <h2>Entrar</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input type="email" placeholder="E-mail" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Senha" value={senha}
          onChange={(e) => setSenha(e.target.value)} required />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
      </form>
      <p>Não tem conta? <Link to="/cadastro">Cadastre-se</Link></p>
    </div>
  );
}