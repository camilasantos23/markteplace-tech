import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMeuPerfil, type PerfilDetalhe } from '../api/perfil';
import styles from './Perfil.module.css'; 

export default function Perfil() {
  const [dados, setDados] = useState<PerfilDetalhe | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMeuPerfil()
      .then(setDados)
      .catch((err) => setErro(err.response?.data?.mensagem ?? 'Erro ao carregar perfil.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: 20, color: '#fff', backgroundColor: '#1a0b2e', minHeight: '100vh' }}>Carregando...</p>;
  if (erro) return <p style={{ padding: 20, color: 'red', backgroundColor: '#1a0b2e', minHeight: '100vh' }}>{erro}</p>;
  if (!dados) return null;

  const { usuario, anuncios } = dados;

  return (
    <div className={styles.container}>
      
      <div className={styles.perfilHeader}>
        <img
          src={usuario.fotoUrl ?? 'https://via.placeholder.com/150/2d144b/d4af37?text=Sem+Foto'}
          alt={usuario.nome}
          className={styles.avatar}
        />
        <div className={styles.infoUsuario}>
          <h2>{usuario.nome}</h2>
          <p><strong>E-mail:</strong> {usuario.email}</p>
          <p>
            <strong>Curso:</strong>{' '}
            {usuario.curso ? (typeof usuario.curso === 'object' ? usuario.curso.nome : usuario.curso) : '—'}
          </p>
          <p><strong>Contato:</strong> {usuario.telefone ?? 'Não informado'}</p>
          
          <Link to="/perfil/editar">
            <button className={styles.btnEditar}>Editar Perfil</button>
          </Link>
        </div>
      </div>

      <h2 className={styles.tituloSecao}>Meus Anúncios</h2>
      
      {anuncios.length === 0 ? (
        <p style={{ color: '#b8a6c9' }}>Nenhum anúncio cadastrado.</p>
      ) : (
        <div className={styles.gridAnuncios}>
          {anuncios.map((a) => {
            const fotoCapa = a.fotos?.find((f) => f.capa)?.url;
            const primeiraFoto = a.fotos?.[0]?.url;
            const urlImagem = fotoCapa || primeiraFoto || 'https://via.placeholder.com/300x180/2d144b/b8a6c9?text=Sem+Foto';

            return (
              <div key={a.id} className={styles.card}>
                
                <img 
                  src={urlImagem} 
                  alt={a.titulo} 
                  className={styles.cardImagem}
                />

                <div className={styles.cardConteudo}>
                  <h3>{a.titulo}</h3>
                  <p>Modalidade: {a.modalidade}</p>
                  
                  {a.precoCentavos != null && (
                    <p className={styles.preco}>R$ {(a.precoCentavos / 100).toFixed(2).replace('.', ',')}</p>
                  )}
                  
                  <span className={styles.badgeEstado}>{a.estado}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}