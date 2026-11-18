// src/pages/PerfilPublico.tsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPerfilUsuario, type PerfilDetalhe } from '../api/perfil';
import type { Anuncio } from '../types';

export default function PerfilPublico() {
  const { id } = useParams<{ id: string }>();
  const [dados, setDados] = useState<PerfilDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const idNum = Number(id);
    if (!id || Number.isNaN(idNum)) {
      setErro('ID de usuário inválido.');
      setLoading(false);
      return;
    }

    let cancelado = false;
    setLoading(true);
    setErro(null);

    getPerfilUsuario(idNum)
      .then((data) => {
        if (!cancelado) setDados(data);
      })
      .catch((err) => {
        if (!cancelado) {
          const status = err.response?.status;
          setErro(
            status === 404
              ? 'Usuário não encontrado.'
              : err.response?.data?.mensagem ?? 'Erro ao carregar perfil.',
          );
        }
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [id]);

  if (loading) return <p style={{ padding: 20 }}>Carregando perfil...</p>;
  if (erro) return <p style={{ padding: 20, color: 'red' }}>{erro}</p>;
  if (!dados) return null;

  const { usuario, anuncios } = dados;

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 20 }}>
        <img
          src={usuario.fotoUrl ?? 'https://via.placeholder.com/100?text=Sem+Foto'}
          alt={usuario.nome}
          style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }}
        />
        <div>
          <h2>{usuario.nome}</h2>
          <p>
            <strong>Curso:</strong>{' '}
            {typeof usuario.curso === 'object' && usuario.curso !== null
              ? usuario.curso.nome
              : usuario.curso ?? '—'}
          </p>
          <p><strong>Contato:</strong> {usuario.telefone ?? 'Não informado'}</p>
        </div>
      </div>

      <hr />

      <h2>Anúncios ativos de {usuario.nome}</h2>
      {anuncios.filter((a) => a.estado === 'ativo').length === 0 ? (
        <p>Este estudante não possui anúncios ativos no momento.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 15,
          }}
        >
          {anuncios
            .filter((a) => a.estado === 'ativo')
            .map((a: Anuncio) => (
              <Link
                key={a.id}
                to={`/anuncios/${a.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 10 }}>
                  {a.fotos?.[0] && (
                    <img
                      src={a.fotos.find((f) => f.capa)?.url ?? a.fotos[0].url}
                      alt={a.titulo}
                      style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 6 }}
                    />
                  )}
                  <h3 style={{ margin: '8px 0 4px' }}>{a.titulo}</h3>
                  <p style={{ margin: 0 }}>Modalidade: {a.modalidade}</p>
                  {a.precoCentavos != null && (
                    <p style={{ margin: 0 }}>
                      <strong>R$ {(a.precoCentavos / 100).toFixed(2)}</strong>
                    </p>
                  )}
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}