import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { atualizarPerfil, uploadFotoPerfil } from '../api/perfil';
import { listarCursos } from '../api/auth';
import { atualizarUsuarioLogado } from '../store/slices/authSlice';
import type { Curso } from '../types';

interface FormState {
  nome: string;
  cursoId: number | '';
  telefone: string;
}

const FORM_VAZIO: FormState = { nome: '', cursoId: '', telefone: '' };

export default function PerfilEditar() {
  const usuario = useAppSelector((s) => s.auth.usuario);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursosErro, setCursosErro] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(FORM_VAZIO);
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  useEffect(() => {
    let cancelado = false;
    listarCursos()
      .then((lista: Curso[]) => {
        if (!cancelado) setCursos(lista);
      })
      .catch((err: unknown) => {
        if (!cancelado) {
          const resposta = (err as { response?: { data?: { mensagem?: string } } }).response;
          setCursosErro(resposta?.data?.mensagem ?? 'Não foi possível carregar os cursos.');
        }
      });
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    if (!usuario) return;

    const cursoUsuario = usuario.curso as Curso | string | null;
    const cursoId: number | '' =
      typeof cursoUsuario === 'object' && cursoUsuario !== null
        ? cursoUsuario.id
        : typeof cursoUsuario === 'string'
          ? (cursos.find((c) => c.nome === cursoUsuario)?.id ?? '')
          : '';

    setForm({
      nome: usuario.nome ?? '',
      cursoId,
      telefone: usuario.telefone ?? '',
    });
  }, [usuario, cursos]);

  useEffect(() => {
    if (!foto) {
      setFotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(foto);
    setFotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [foto]);

  const alterado = useMemo(() => {
    if (!usuario) return false;
    const cursoOriginal =
      typeof usuario.curso === 'object' && usuario.curso !== null ? usuario.curso.id : '';
    return (
      form.nome !== (usuario.nome ?? '') ||
      String(form.cursoId) !== String(cursoOriginal) ||
      form.telefone !== (usuario.telefone ?? '') ||
      foto !== null
    );
  }, [form, foto, usuario]);

  const handleChange =
    (campo: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const raw = e.target.value;
      setForm((prev) => ({
        ...prev,
        [campo]: campo === 'cursoId' ? (raw === '' ? '' : Number(raw)) : raw,
      }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem(null);

    if (!form.nome.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Informe o nome.' });
      return;
    }
    if (form.cursoId === '') {
      setMensagem({ tipo: 'erro', texto: 'Escolha um curso.' });
      return;
    }

    setSalvando(true);
    try {
     let usuarioAtualizado = await atualizarPerfil({
  nome: form.nome.trim(),
  cursoId: Number(form.cursoId), // ⚠️
  telefone: form.telefone.trim() || undefined,
});
      if (foto) {
        usuarioAtualizado = await uploadFotoPerfil(foto);
      }

      dispatch(atualizarUsuarioLogado(usuarioAtualizado));
      setMensagem({ tipo: 'ok', texto: 'Perfil atualizado com sucesso!' });
      setTimeout(() => navigate('/perfil'), 900);
    } catch (err: any) {
      setMensagem({
        tipo: 'erro',
        texto: err.response?.data?.mensagem ?? 'Erro ao atualizar perfil.',
      });
    } finally {
      setSalvando(false);
    }
  };

  if (!usuario) return <p>Carregando...</p>;

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', maxWidth: 520 }}>
      <h1>Editar Perfil</h1>

      {mensagem && (
        <p
          style={{
            padding: 8,
            borderRadius: 4,
            background: mensagem.tipo === 'ok' ? '#e6f4ea' : '#fdecea',
            color: mensagem.tipo === 'ok' ? '#1e7e34' : '#a12622',
          }}
        >
          {mensagem.texto}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          Nome
          <input type="text" value={form.nome} onChange={handleChange('nome')} required />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          Curso
          <select
            value={form.cursoId === '' ? '' : String(form.cursoId)}
            onChange={handleChange('cursoId')}
            required
            disabled={cursos.length === 0}
          >
            <option value="">
              {cursosErro ? cursosErro : cursos.length === 0 ? 'Carregando cursos...' : 'Selecione um curso'}
            </option>
            {cursos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          Telefone / WhatsApp (opcional)
          <input
            type="tel"
            value={form.telefone}
            onChange={handleChange('telefone')}
            placeholder="(83) 99999-9999"
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          Foto de Perfil
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
          />
        </label>

        {(fotoPreview || usuario.fotoUrl) && (
          <img
            src={fotoPreview ?? usuario.fotoUrl ?? ''}
            alt="Pré-visualização"
            style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '1px solid #ccc' }}
          />
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button type="submit" disabled={salvando || !alterado}>
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
          <button type="button" onClick={() => navigate('/perfil')} disabled={salvando}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}