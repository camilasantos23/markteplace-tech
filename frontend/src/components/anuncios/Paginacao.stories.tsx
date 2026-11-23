import type { Meta, StoryObj } from '@storybook/react';
import Paginacao from './Paginacao';

const meta: Meta<typeof Paginacao> = {
  title: 'Anuncios/Paginacao',
  component: Paginacao,
  tags: ['autodocs'],
  argTypes: {
    onMudarPagina: { action: 'mudouPagina' },
  },
};

export default meta;
type Story = StoryObj<typeof Paginacao>;

export const PrimeiraPagina: Story = {
  args: {
    pagina: 1,
    totalPaginas: 5,
  },
};

export const PaginaIntermediaria: Story = {
  args: {
    pagina: 3,
    totalPaginas: 5,
  },
};

export const UltimaPagina: Story = {
  args: {
    pagina: 5,
    totalPaginas: 5,
  },
};