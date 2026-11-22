import { Link } from 'react-router-dom';
import type { AnuncioResumo } from '../../types/anuncioBusca';
import styles from './CardAnuncio.module.css';

interface CardAnuncioProps {
  anuncio: AnuncioResumo;
}

function formatarPreco(preco: number | null) {
  if (preco === null) return 'Gratuito';
  return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarConservacao(valor: string) {
  const nomes: Record<string, string> = {
    novo: 'Novo',
    seminovo: 'Seminovo',
    usado: 'Usado',
  };
  return nomes[valor] ?? valor;
}

export default function CardAnuncio({ anuncio }: CardAnuncioProps) {
  return (
    <article className={styles.card}>
      <Link to={`/anuncios/${anuncio.id}`} className={styles.link} aria-label={`Ver anúncio ${anuncio.titulo}`}>
        <div className={styles.imagemWrap}>
          {anuncio.capaUrl ? (
            <img className={styles.imagem} src={anuncio.capaUrl} alt={anuncio.titulo} loading="lazy" />
          ) : (
            <div className={styles.semImagem} aria-label="Anúncio sem foto">TECH</div>
          )}
          <span className={styles.badge}>{anuncio.categoria.nome}</span>
        </div>
        <div className={styles.conteudo}>
          <p className={styles.conservacao}>{formatarConservacao(anuncio.estadoConservacao)}</p>
          <h2 className={styles.titulo}>{anuncio.titulo}</h2>
          <p className={styles.preco}>{formatarPreco(anuncio.preco)}</p>
          <p className={styles.anunciante}>Anunciado por {anuncio.anunciante.nome}</p>
        </div>
      </Link>
    </article>
  );
}
