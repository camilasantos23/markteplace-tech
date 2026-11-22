import type { Categoria, EstadoConservacao, Modalidade, Paginado } from './index';

/** Formato resumido retornado por GET /anuncios. Preço em reais. */
export interface AnuncioResumo {
  id: number;
  titulo: string;
  modalidade: Modalidade;
  preco: number | null;
  estado: 'ativo' | 'pausado' | 'reservado' | 'vendido' | 'concluido';
  estadoConservacao: EstadoConservacao;
  categoria: Categoria;
  capaUrl: string;
  anunciante: {
    id: number;
    nome: string;
  };
  publicadoEm: string;
}

export type ResultadoBuscaAnuncios = Paginado<AnuncioResumo>;

export interface FiltrosBuscaAnuncios {
  modalidade: Modalidade;
  categoria?: string;
  precoMin?: string;
  precoMax?: string;
  ordem: 'data' | 'preco';
  direcao: 'asc' | 'desc';
  pagina: number;
  tamanho: 5 | 10 | 25 | 50;
}
