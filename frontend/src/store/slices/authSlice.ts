import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import * as authApi from '../../api/auth';
import { api } from '../../api/client';
import type { Usuario } from '../../types';

interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  usuario: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

const extrairErro = (err: any) =>
  err.response?.data?.mensagem ?? err.response?.data?.message ?? 'Erro inesperado.';

// 1. Thunk de Login (Estudante)
export const loginThunk = createAsyncThunk(
  'auth/login',
  async (cred: { email: string; senha: string }, { rejectWithValue }) => {
    try {
      return await authApi.login(cred.email, cred.senha);
    } catch (err: any) {
      return rejectWithValue(extrairErro(err));
    }
  },
);

// 2. Thunk de Login (Administrador)
export const loginAdminThunk = createAsyncThunk(
  'auth/loginAdmin',
  async (cred: { email: string; senha: string }, { rejectWithValue }) => {
    try {
      return await authApi.loginAdmin(cred.email, cred.senha);
    } catch (err: any) {
      return rejectWithValue(extrairErro(err));
    }
  },
);

// 3. Thunk para Restaurar a Sessão (usado quando você dá F5 na página)
export const restaurarSessaoThunk = createAsyncThunk(
  'auth/restaurarSessao',
  async (_, { rejectWithValue }) => {
    try {
      // ⚠️ ROTA CORRETA DO SWAGGER: /usuarios/eu (retorna apenas o objeto do Usuario)
      const { data } = await api.get<Usuario>('/usuarios/eu');
      return data; 
    } catch (err: any) {
      // Se o token estiver expirado ou inválido, cai aqui
      return rejectWithValue('Sessão expirada.');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem('token');
      state.usuario = null;
      state.token = null;
      state.error = null;
    },
    atualizarUsuarioLogado(state, action: PayloadAction<Usuario>) {
      state.usuario = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Lógica compartilhada para o Login de Estudante e de Admin
    const loginCases = [loginThunk, loginAdminThunk] as const;
    
    for (const thunk of loginCases) {
      builder
        .addCase(thunk.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.loading = false;
          state.token = action.payload.token;
          state.usuario = action.payload.usuario;
          localStorage.setItem('token', action.payload.token);
        })
        .addCase(thunk.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        });
    }

    // Lógica para restaurar a sessão
    builder
      .addCase(restaurarSessaoThunk.fulfilled, (state, action) => {
        state.usuario = action.payload;
      })
      .addCase(restaurarSessaoThunk.rejected, (state) => {
        // Se falhar ao restaurar, limpa tudo para não travar a tela
        state.usuario = null;
        state.token = null;
        localStorage.removeItem('token');
      });
  },
});

export const { logout, atualizarUsuarioLogado } = authSlice.actions;
export default authSlice.reducer;