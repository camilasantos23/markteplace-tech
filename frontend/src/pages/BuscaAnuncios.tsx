import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { buscarAnuncios, listarCategorias } from '../api/anunciosBusca';
import CardAnuncio from '../components/anuncios/CardAnuncio';
import Paginacao from '../components/anuncios/Paginacao';
import type { Categoria, Modalidade } from '../types';
import type { AnuncioResumo, FiltrosBuscaAnuncios, ResultadoBuscaAnuncios } from '../types/anuncioBusca';
import styles from './BuscaAnuncios.module.css';

interface BuscaAnunciosProps { modalidade: Modalidade; }

const TAMANHOS = [5, 10, 25, 50] as const;
const VAZIO: ResultadoBuscaAnuncios = { itens: [], pagina: 1, tamanho: 10, total: 0, totalPaginas: 0 };

function numeroPositivo(valor: string | null, padrao: number) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : padrao;
}

export default function BuscaAnuncios({ modalidade }: BuscaAnunciosProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.toString();
  const filtros = useMemo<FiltrosBuscaAnuncios>(() => {
    const parametros = new URLSearchParams(query);
    const ordemParam = parametros.get('ordem');
    const direcaoParam = parametros.get('direcao');
    const tamanhoParam = Number(parametros.get('tamanho') ?? 10);
    const tamanho = TAMANHOS.includes(tamanhoParam as (typeof TAMANHOS)[number])
      ? tamanhoParam as FiltrosBuscaAnuncios['tamanho'] : 10;

    return {
      modalidade,
      categoria: parametros.get('categoria') || undefined,
      precoMin: parametros.get('precoMin') || undefined,
      precoMax: parametros.get('precoMax') || undefined,
      ordem: ordemParam === 'preco' && modalidade === 'venda' ? 'preco' : 'data',
      direcao: direcaoParam === 'asc' ? 'asc' : direcaoParam === 'desc' ? 'desc' : ordemParam === 'preco' ? 'asc' : 'desc',
      pagina: numeroPositivo(parametros.get('pagina'), 1),
      tamanho,
    };
  }, [modalidade, query]);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [resultado, setResultado] = useState<ResultadoBuscaAnuncios>(VAZIO);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [precoMin, setPrecoMin] = useState(filtros.precoMin ?? '');
  const [precoMax, setPrecoMax] = useState(filtros.precoMax ?? '');

  useEffect(() => {
    setPrecoMin(filtros.precoMin ?? '');
    setPrecoMax(filtros.precoMax ?? '');
  }, [filtros.precoMin, filtros.precoMax]);

  useEffect(() => {
    let ativo = true;
    listarCategorias()
      .then((dados) => { if (ativo) setCategorias(dados); })
      .catch(() => { if (ativo) setCategorias([]); });
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);
    buscarAnuncios(filtros)
      .then((dados) => { if (ativo) setResultado(dados); })
      .catch((falha: unknown) => {
        if (!ativo) return;
        const mensagem = (falha as { response?: { data?: { mensagem?: string } } })?.response?.data?.mensagem;
        setErro(mensagem ?? 'Não foi possível carregar os anúncios. Verifique se a API está em execução.');
        setResultado(VAZIO);
      })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [filtros]);

  const atualizarUrl = useCallback((alteracoes: Record<string, string | undefined>, reiniciarPagina = true) => {
    const novos = new URLSearchParams(searchParams);
    Object.entries(alteracoes).forEach(([chave, valor]) => {
      if (valor === undefined || valor === '') novos.delete(chave);
      else novos.set(chave, valor);
    });
    if (reiniciarPagina) novos.delete('pagina');
    setSearchParams(novos);
  }, [searchParams, setSearchParams]);

  function aplicarFiltros(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (precoMin && precoMax && Number(precoMin) > Number(precoMax)) {
      setErro('O preço mínimo não pode ser maior que o preço máximo.');
      return;
    }
    atualizarUrl({ precoMin: modalidade === 'venda' ? precoMin : undefined, precoMax: modalidade === 'venda' ? precoMax : undefined });
  }

  const titulo = modalidade === 'venda' ? 'Produtos à venda' : 'Produtos para doação';

  return (
    <main className={styles.pagina}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>MARKETPLACE IFPB · TECNOLOGIA</p>
          <h1>{titulo}</h1>
          <p className={styles.subtitulo}>
            {modalidade === 'venda'
              ? 'Encontre teclados, fones, periféricos e componentes para seu setup.'
              : 'Descubra equipamentos e acessórios de tecnologia disponibilizados pela comunidade.'}
          </p>
        </div>
        <div className={styles.linksModalidade}>
          <Link className={modalidade === 'venda' ? styles.ativo : ''} to="/vendas">Comprar</Link>
          <Link className={modalidade === 'doacao' ? styles.ativo : ''} to="/doacoes">Doações</Link>
        </div>
      </section>

      <form className={styles.filtros} onSubmit={aplicarFiltros}>
        <label>
          Categoria
          <select value={filtros.categoria ?? ''} onChange={(e) => atualizarUrl({ categoria: e.target.value || undefined })}>
            <option value="">Todas as categorias</option>
            {categorias.map((categoria) => <option key={categoria.id} value={categoria.slug}>{categoria.nome}</option>)}
          </select>
        </label>

        {modalidade === 'venda' && (
          <>
            <label>
              Preço mínimo (R$)
              <input type="number" min="0" step="0.01" placeholder="Ex.: 50" value={precoMin} onChange={(e) => setPrecoMin(e.target.value)} />
            </label>
            <label>
              Preço máximo (R$)
              <input type="number" min="0" step="0.01" placeholder="Ex.: 500" value={precoMax} onChange={(e) => setPrecoMax(e.target.value)} />
            </label>
          </>
        )}

        <label>
          Ordenar por
          <select value={`${filtros.ordem}-${filtros.direcao}`} onChange={(e) => {
            const [ordem, direcao] = e.target.value.split('-');
            atualizarUrl({ ordem, direcao });
          }}>
            <option value="data-desc">Mais recentes</option>
            <option value="data-asc">Mais antigos</option>
            {modalidade === 'venda' && <>
              <option value="preco-asc">Menor preço</option>
              <option value="preco-desc">Maior preço</option>
            </>}
          </select>
        </label>

        <label>
          Itens por página
          <select value={filtros.tamanho} onChange={(e) => atualizarUrl({ tamanho: e.target.value })}>
            {TAMANHOS.map((tamanho) => <option key={tamanho} value={tamanho}>{tamanho}</option>)}
          </select>
        </label>
        {modalidade === 'venda' && <button className={styles.aplicar} type="submit">Aplicar preço</button>}
      </form>

      <section className={styles.resultados} aria-live="polite">
        <div className={styles.resultadoCabecalho}>
          <h2>Anúncios encontrados</h2>
          {!carregando && <span>{resultado.total} {resultado.total === 1 ? 'produto' : 'produtos'}</span>}
        </div>

        {carregando && <p className={styles.mensagem}>Carregando anúncios...</p>}
        {!carregando && erro && <div className={styles.erro} role="alert">{erro}</div>}
        {!carregando && !erro && resultado.itens.length === 0 && (
          <div className={styles.vazio}>
            <span aria-hidden="true">⌕</span>
            <h3>Nenhum anúncio encontrado</h3>
            <p>Tente alterar os filtros para encontrar outros produtos.</p>
            <button type="button" onClick={() => setSearchParams(new URLSearchParams())}>Limpar filtros</button>
          </div>
        )}

        {!carregando && !erro && resultado.itens.length > 0 && (
          <>
            <div className={styles.grade}>
              {resultado.itens.map((anuncio: AnuncioResumo) => <CardAnuncio key={anuncio.id} anuncio={anuncio} />)}
            </div>
            <Paginacao pagina={resultado.pagina} totalPaginas={resultado.totalPaginas}
              onMudarPagina={(pagina) => atualizarUrl({ pagina: String(pagina) }, false)} />
          </>
        )}
      </section>
    </main>
  );
}
