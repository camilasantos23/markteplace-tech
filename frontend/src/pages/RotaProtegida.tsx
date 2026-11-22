import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  apenasAdmin?: boolean;
}

export default function RotaProtegida({ children, apenasAdmin = false }: Props) {
  const { token, usuario } = useAppSelector((s) => s.auth);
  const location = useLocation();

  if (!token) {
    return <Navigate to={apenasAdmin ? '/admin/login' : '/login'} replace state={{ from: location }} />;
  }

  if (apenasAdmin && usuario?.papel !== 'administrador') {
    return <Navigate to="/vendas" replace />;
  }
  if (!apenasAdmin && usuario?.papel === 'administrador') {
    return <Navigate to="/admin/anuncios" replace />;
  }

  return <>{children}</>;
}