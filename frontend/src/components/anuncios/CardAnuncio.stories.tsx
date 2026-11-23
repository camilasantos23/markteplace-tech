import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import CardAnuncio from './CardAnuncio';
import type { AnuncioResumo } from '../../types/anuncioBusca';

const meta: Meta<typeof CardAnuncio> = {
  title: 'Anuncios/CardAnuncio',
  component: CardAnuncio,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ maxWidth: '320px' }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CardAnuncio>;

const anuncioBase: AnuncioResumo = {
  id: 1,
  titulo: 'Notebook Dell Inspiron 15 i5 16GB RAM',
  modalidade: 'venda',
  preco: 2450.0,
  estado: 'ativo',
  estadoConservacao: 'seminovo',
  capaUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600',
  categoria: {
    id: 1,
    nome: 'Notebooks',
    slug: 'notebooks',
  },
  anunciante: {
    id: 10,
    nome: 'Abigail',
  },
  publicadoEm: '2026-11-23T12:00:00Z',
};

export const PadraoComFoto: Story = {
  args: {
    anuncio: anuncioBase,
  },
};

export const SemFoto: Story = {
  args: {
    anuncio: {
      ...anuncioBase,
      id: 2,
      titulo: 'Teclado Mecânico Redragon Kumara',
      preco: 180.0,
      estadoConservacao: 'usado',
      capaUrl: '',
      categoria: {
        id: 2,
        nome: 'Periféricos',
        slug: 'perifericos',
      },
    },
  },
};

export const GratuitoNovo: Story = {
  args: {
    anuncio: {
      ...anuncioBase,
      id: 3,
      titulo: 'Apostila de Algoritmos e Estrutura de Dados',
      modalidade: 'doacao',
      preco: null,
      estadoConservacao: 'novo',
      capaUrl: '',
      categoria: {
        id: 3,
        nome: 'Materiais de Estudo',
        slug: 'materiais-de-estudo',
      },
    },
  },
};