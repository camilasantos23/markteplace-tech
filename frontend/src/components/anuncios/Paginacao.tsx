import styles from './Paginacao.module.css';

interface PaginacaoProps {
  pagina: number;
  totalPaginas: number;
  onMudarPagina: (pagina: number) => void;
}

export default function Paginacao({ pagina, totalPaginas, onMudarPagina }: PaginacaoProps) {
  if (totalPaginas <= 1) return null;

  return (
    <nav className={styles.paginacao} aria-label="Paginação dos anúncios">
      <button type="button" onClick={() => onMudarPagina(pagina - 1)} disabled={pagina <= 1}>
        Anterior
      </button>
      <span>Página <strong>{pagina}</strong> de <strong>{totalPaginas}</strong></span>
      <button type="button" onClick={() => onMudarPagina(pagina + 1)} disabled={pagina >= totalPaginas}>
        Próxima
      </button>
    </nav>
  );
}
