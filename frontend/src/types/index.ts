export interface Curso {
  id: number;
  nome: string;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  curso: Curso | null;         
  telefone?: string | null;
  fotoUrl?: string | null;
  papel: 'estudante' | 'administrador';
}

export interface Categoria {
  id: number;
  nome: string;
  slug: string;
}

export interface FotoAnuncio {
  id: number;
  url: string;
  capa: boolean;
}

export type Modalidade = 'venda' | 'doacao';
export type EstadoConservacao = 'novo' | 'seminovo' | 'usado';
export type EstadoAnuncio =
  | 'ativo' | 'pausado' | 'reservado' | 'vendido' | 'concluido';

export interface Anuncio {
  id: number;
  titulo: string;
  descricao: string;
  modalidade: Modalidade;
  precoCentavos?: number | null;
  estadoConservacao: EstadoConservacao;
  estado: EstadoAnuncio;
  localEntrega: string;
  categoria: Categoria;
  anunciante: Usuario;
  fotos: FotoAnuncio[];
  criadoEm: string;
}

export interface Paginado<T> {
  itens: T[];
  pagina: number;
  tamanho: number;
  total: number;
  totalPaginas: number;
}