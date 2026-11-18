import { api } from './client';
import type { Usuario, Anuncio, Paginado } from '../types';

export interface PerfilDetalhe {
  usuario: Usuario;
  anuncios: Anuncio[];
}


export const getMeuPerfil = async (): Promise<PerfilDetalhe> => {
  const { data: usuario } = await api.get<Usuario>('/usuarios/eu');
  
  let anuncios: Anuncio[] = [];
  try {
    const response = await api.get<Paginado<Anuncio> | Anuncio[]>(`/usuarios/${usuario.id}/anuncios`);
    if (Array.isArray(response.data)) {
      anuncios = response.data;
    } else {
      anuncios = response.data.itens || [];
    }
  } catch (error) {
    console.warn('Não foi possível carregar os anúncios do usuário', error);
  }

  return { usuario, anuncios };
};

export const getPerfilUsuario = async (id: number): Promise<PerfilDetalhe> => {
  const { data: usuario } = await api.get<Usuario>(`/usuarios/${id}`);
  
  let anuncios: Anuncio[] = [];
  try {
    const response = await api.get<Paginado<Anuncio> | Anuncio[]>(`/usuarios/${id}/anuncios`);
    
    if (Array.isArray(response.data)) {
      anuncios = response.data;
    } else {
      anuncios = response.data.itens || [];
    }
  } catch (error) {
    console.warn('Não foi possível carregar os anúncios', error);
  }

  return { usuario, anuncios };
};

export const atualizarPerfil = async (dados: {
  nome: string;
  cursoId: number;
  telefone?: string;
}): Promise<Usuario> => {
  const { data } = await api.put<Usuario>('/usuarios/eu', dados);
  return data;
};

export const uploadFotoPerfil = async (file: File): Promise<Usuario> => {
  const formData = new FormData();
  formData.append('foto', file);
  const { data } = await api.put<Usuario>('/usuarios/eu/foto', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};