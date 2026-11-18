import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../api/client';
import type { Anuncio } from '../../types';

interface AnunciosState {
  atual: Anuncio | null;
  loading: boolean;
  error: string | null;
}

const initialState: AnunciosState = { atual: null, loading: false, error: null };

export const buscarAnuncioThunk = createAsyncThunk(
  'anuncios/buscar',
  async (id: number, { rejectWithValue }) => {
    try {
      const { data } = await api.get<Anuncio>(`/anuncios/${id}`);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.mensagem ?? 'Erro ao carregar anúncio.');
    }
  },
);

export const criarAnuncioThunk = createAsyncThunk(
  'anuncios/criar',
  async (form: FormData, { rejectWithValue }) => {
    try {
      const { data } = await api.post<Anuncio>('/anuncios', form);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.mensagem ?? 'Erro ao criar anúncio.');
    }
  },
);

export const editarAnuncioThunk = createAsyncThunk(
  'anuncios/editar',
  async ({ id, form }: { id: number; form: FormData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put<Anuncio>(`/anuncios/${id}`, form);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.mensagem ?? 'Erro ao editar anúncio.');
    }
  },
);

export const alterarEstadoAnuncioThunk = createAsyncThunk(
  'anuncios/alterarEstado',
  async ({ id, estado }: { id: number; estado: Anuncio['estado'] }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch<Anuncio>(`/anuncios/${id}/estado`, { estado });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.mensagem ?? 'Erro ao alterar estado.');
    }
  },
);

const anunciosSlice = createSlice({
  name: 'anuncios',
  initialState,
  reducers: {
    limparAnuncio(state) {
      state.atual = null;
      state.error = null;
    },
  },
  extraReducers: (b) => {
    const casos = [buscarAnuncioThunk, criarAnuncioThunk, editarAnuncioThunk, alterarEstadoAnuncioThunk];
    for (const thunk of casos) {
      b.addCase(thunk.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
        .addCase(thunk.fulfilled, (s, a) => {
          s.loading = false;
          s.atual = a.payload as Anuncio;
        })
        .addCase(thunk.rejected, (s, a) => {
          s.loading = false;
          s.error = a.payload as string;
        });
    }
  },
});

export const { limparAnuncio } = anunciosSlice.actions;
export default anunciosSlice.reducer;