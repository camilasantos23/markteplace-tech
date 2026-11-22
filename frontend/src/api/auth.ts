import { api } from './client';
import type { Curso, Usuario } from '../types';

export interface LoginResposta {
  token: string;
  usuario: Usuario;
}

export const login = async (email: string, senha: string) => {
  const { data } = await api.post<LoginResposta>('/auth/login', { email, senha });
  return data;
};

export const loginAdmin = async (email: string, senha: string) => {
  const { data } = await api.post<LoginResposta>('/admin/login', { email, senha });
  return data;
};

export interface CadastroDados {
  nome: string;
  email: string;
  senha: string;
  cursoId: number;
  telefone?: string;
}

export const cadastrar = async (dados: CadastroDados) => {
  const { data } = await api.post<Usuario>('/auth/cadastro', dados);
  return data;
};

export const listarCursos = async () => {
  const { data } = await api.get<Curso[]>('/cursos');
  return data;
};