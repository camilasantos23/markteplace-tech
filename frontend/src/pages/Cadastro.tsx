import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth';
import type { Curso } from '../types';

const DOMINIO = '@academico.ifpb.edu.br';

export default function Cadastro() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cursoId, setCursoId] = useState<number | ''>('');
  const [telefone, setTelefone] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    authApi.listarCursos().then(setCursos).catch(() =>
      setErro('Não foi possível carregar os cursos.'),
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (!email.endsWith(DOMINIO)) {
      setErro(`O e-mail precisa terminar com ${DOMINIO}.`);
      return;
    }
    if (!cursoId) {
      setErro('Escolha um curso.');
      return;
    }
    setEnviando(true);
    try {
      await authApi.cadastrar({ nome, email, senha, cursoId: Number(cursoId), telefone });
      navigate('/login');
    } catch (err: any) {
      setErro(err.response?.data?.mensagem ?? 'Erro ao cadastrar.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '60px auto', fontFamily: 'sans-serif' }}>
      <h2>Criar conta</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        <input type="email" placeholder={`E-mail ${DOMINIO}`} value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Senha" value={senha}
          onChange={(e) => setSenha(e.target.value)} minLength={6} required />
        <select value={cursoId} onChange={(e) => setCursoId(Number(e.target.value))} required>
          <option value="">Selecione um curso</option>
          {cursos.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <input placeholder="Telefone/WhatsApp (opcional)" value={telefone}
          onChange={(e) => setTelefone(e.target.value)} />
        {erro && <p style={{ color: 'red' }}>{erro}</p>}
        <button type="submit" disabled={enviando}>{enviando ? 'Cadastrando...' : 'Cadastrar'}</button>
      </form>
      <p>Já tem conta? <Link to="/login">Entrar</Link></p>
    </div>
  );
}