import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { atualizarPerfil, uploadFotoPerfil } from '../api/perfil';
import { listarCursos } from '../api/auth';
import { atualizarUsuarioLogado } from '../store/slices/authSlice';
import type { Curso } from '../types';
import styles from './PerfilEditar.module.css'; // Importação do CSS Module

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
        cursoId: Number(form.cursoId),
        telefone: form.telefone.trim() || undefined,
      });
      
      if (foto) {
        usuarioAtualizado = await uploadFotoPerfil(foto);
      }

      dispatch(atualizarUsuarioLogado(usuarioAtualizado));
      setMensagem({ tipo: 'ok', texto: 'Perfil atualizado com sucesso!' });
      setTimeout(() => navigate('/perfil'), 1200);
    } catch (err: any) {
      setMensagem({
        tipo: 'erro',
        texto: err.response?.data?.mensagem ?? 'Erro ao atualizar perfil.',
      });
    } finally {
      setSalvando(false);
    }
  };

  if (!usuario) return <p style={{ textAlign: 'center', marginTop: 50 }}>Carregando...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.titulo}>Editar Perfil</h1>

      {mensagem && (
        <p className={`${styles.mensagem} ${mensagem.tipo === 'ok' ? styles.msgSucesso : styles.msgErro}`}>
          {mensagem.texto}
        </p>
      )}

      <form onSubmit={handleSubmit} className={styles.formulario}>
        <div className={styles.grupo}>
          <label>Nome Completo</label>
          <input
            type="text"
            value={form.nome}
            onChange={handleChange('nome')}
            required
          />
        </div>

        <div className={styles.grupo}>
          <label>Curso</label>
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
        </div>

        <div className={styles.grupo}>
          <label>Telefone / WhatsApp (opcional)</label>
          <input
            type="tel"
            value={form.telefone}
            onChange={handleChange('telefone')}
            placeholder="(83) 99999-9999"
          />
        </div>

        <div className={styles.grupo}>
          <label>Foto de Perfil</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
          />
        </div>

        {(fotoPreview || usuario.fotoUrl) && (
          <img
            src={fotoPreview ?? usuario.fotoUrl ?? ''}
            alt="Pré-visualização"
            className={styles.previewFoto}
          />
        )}

        <div className={styles.botoes}>
          <button type="submit" className={styles.btnSalvar} disabled={salvando || !alterado}>
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
          <button type="button" className={styles.btnCancelar} onClick={() => navigate('/perfil')} disabled={salvando}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}