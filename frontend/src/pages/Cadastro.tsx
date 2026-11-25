import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth';
import type { Curso } from '../types';
import '../styles/techmarket.css';

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
    <main className="auth-layout"><aside className="auth-brand"><Link className="brand auth-brand-logo" to="/login"><span className="brand-mark">▥</span><span>TechMarket<small>IFPB · Cajazeiras</small></span></Link><div className="auth-brand-copy"><span className="auth-kicker">FEITO NO IFPB, PARA O IFPB</span><h1>Conecte-se à comunidade tech do campus.</h1><p>Crie sua conta para comprar, doar e negociar com outros estudantes.</p></div><span className="auth-foot">IFPB Campus Cajazeiras · Projeto acadêmico</span></aside>
      <section className="auth-panel"><div className="auth-form-wrap"><span className="form-eyebrow">COMECE POR AQUI</span><h2>Crie sua conta</h2><p className="form-description">Use seu e-mail institucional para participar.</p><form onSubmit={handleSubmit} className="auth-form">
      <label>Nome completo<input placeholder="Seu nome" value={nome} onChange={e => setNome(e.target.value)} required /></label>
      <label>E-mail institucional<input type="email" placeholder={`seu.nome${DOMINIO}`} value={email} onChange={e => setEmail(e.target.value)} required /></label>
      <label>Senha<input type="password" placeholder="Pelo menos 6 caracteres" value={senha} onChange={e => setSenha(e.target.value)} minLength={6} required /></label>
      <label>Curso<select value={cursoId} onChange={e => setCursoId(e.target.value ? Number(e.target.value) : '')} required><option value="">Selecione um curso</option>{cursos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></label>
      <label>Telefone / WhatsApp (opcional)<input placeholder="(83) 99999-9999" value={telefone} onChange={e => setTelefone(e.target.value)} /></label>
      {erro && <p className="form-error" role="alert">{erro}</p>}<button type="submit" disabled={enviando}>{enviando ? 'Cadastrando...' : 'Criar conta →'}</button></form><p className="auth-bottom">Já tem conta? <Link to="/login">Entrar</Link></p></div></section>
    </main>
  );
}
