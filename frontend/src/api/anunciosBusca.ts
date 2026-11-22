import { api } from './client';
import type { Categoria } from '../types';
import type { FiltrosBuscaAnuncios, ResultadoBuscaAnuncios } from '../types/anuncioBusca';

export async function buscarAnuncios(filtros: FiltrosBuscaAnuncios) {
  const params = new URLSearchParams({
    modalidade: filtros.modalidade,
    ordem: filtros.ordem,
    direcao: filtros.direcao,
    pagina: String(filtros.pagina),
    tamanho: String(filtros.tamanho),
  });

  if (filtros.categoria) params.set('categoria', filtros.categoria);
  if (filtros.modalidade === 'venda' && filtros.precoMin) params.set('precoMin', filtros.precoMin);
  if (filtros.modalidade === 'venda' && filtros.precoMax) params.set('precoMax', filtros.precoMax);

  const { data } = await api.get<ResultadoBuscaAnuncios>(`/anuncios?${params.toString()}`);
  return data;
}

export async function listarCategorias() {
  const { data } = await api.get<Categoria[]>('/categorias');
  return data;
}
