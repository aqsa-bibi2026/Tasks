import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  Activity,
  BarChart3,
  CheckCircle2,
  Database,
  Gauge,
  Layers3,
  LoaderCircle,
  Plus,
  RefreshCcw,
  Server,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wifi
} from 'lucide-react';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';

import {
  createDemoItem,
  deleteItem,
  fetchItems,
  fetchMetrics,
  fetchStats
} from './api.js';

const categories = [
  'all',
  'analytics',
  'operations',
  'finance'
];

function formatNumber(value) {
  const number = Number(value || 0);

  if (Math.abs(number) >= 1000) {
    return new Intl.NumberFormat('en', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(number);
  }

  return number.toLocaleString(undefined, {
    maximumFractionDigits: 2
  });
}

function timeAgo(value) {
  const seconds = Math.max(
    0,
    Math.floor(
      (Date.now() - new Date(value).getTime()) / 1000
    )
  );

  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  return `${Math.floor(minutes / 60)}h ago`;
}

export default function App() {
  const queryClient = useQueryClient();

  const [category, setCategory] = useState('all');
  const [notice, setNotice] = useState('');

  const itemsQuery = useQuery({
    queryKey: ['items', category],
    queryFn: () => fetchItems(category),
    placeholderData: keepPreviousData
  });

  const statsQuery = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    staleTime: 45_000
  });

  const metricsQuery = useQuery({
    queryKey: ['server-metrics'],
    queryFn: fetchMetrics,
    staleTime: 0,
    refetchInterval: 2500,
    refetchOnWindowFocus: false
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createDemoItem(
        category === 'all' ? 'analytics' : category
      ),
    onSuccess: async (data) => {
      setNotice(data.message);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['items']
        }),
        queryClient.invalidateQueries({
          queryKey: ['stats']
        })
      ]);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: async (data) => {
      setNotice(data.message);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['items']
        }),
        queryClient.invalidateQueries({
          queryKey: ['stats']
        })
      ]);
    }
  });

  useEffect(() => {
    const index = categories.indexOf(category);
    const next =
      categories[(index + 1) % categories.length];

    if (next && next !== category) {
      queryClient.prefetchQuery({
        queryKey: ['items', next],
        queryFn: () => fetchItems(next),
        staleTime: 30_000
      });
    }
  }, [category, queryClient]);

  const stats = statsQuery.data?.stats || {};

  const currentData = itemsQuery.data;
  const items = currentData?.items || [];

  const cacheEntries = useMemo(
    () =>
      queryClient
        .getQueryCache()
        .getAll()
        .filter((query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === 'items'
        ).length,
    [
      category,
      itemsQuery.dataUpdatedAt,
      metricsQuery.dataUpdatedAt,
      queryClient
    ]
  );

  const refreshEverything = async () => {
    setNotice(
      'Cache invalidated. Fresh data requested.'
    );

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['items']
      }),
      queryClient.invalidateQueries({
        queryKey: ['stats']
      })
    ]);
  };

  return (
    <div className="app">
      <aside>
        <div className="brand">
          <span>
            <Activity size={21} />
          </span>

          <div>
            <b>QueryPulse</b>
            <small>Data Performance Console</small>
          </div>
        </div>

        <nav>
          <button className="active">
            <Gauge size={18} />
            Query dashboard
          </button>

          <button disabled>
            <Database size={18} />
            Cache inspector
          </button>

          <button disabled>
            <Server size={18} />
            API telemetry
          </button>
        </nav>

        <div className="tech-card">
          <Sparkles size={19} />
          <b>TanStack Query v5</b>
          <p>
            Smart caching, request deduplication,
            retries, prefetching and background refresh.
          </p>

          <span>
            <CheckCircle2 size={15} />
            30s stale window
          </span>
        </div>

        <div className="task">
          TASK 20
          <strong>Optimized React data fetching</strong>
        </div>
      </aside>

      <main>
        <header>
          <div>
            <div className="eyebrow">
              CLIENT DATA PERFORMANCE
            </div>

            <h1>
              Fetch less.
              <em> Feel faster.</em>
            </h1>

            <p>
              Cached queries return instantly while React Query
              handles background refresh, request deduplication
              and invalidation automatically.
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={refreshEverything}
          >
            <RefreshCcw
              size={17}
              className={
                itemsQuery.isFetching ? 'spin' : ''
              }
            />
            Refresh data
          </button>
        </header>

        <section className="stats-grid">
          <article>
            <span>
              <Wifi size={20} />
            </span>
            <div>
              <small>API REQUESTS</small>
              <b>
                {metricsQuery.data?.apiRequests ?? 0}
              </b>
            </div>
          </article>

          <article>
            <span>
              <Layers3 size={20} />
            </span>
            <div>
              <small>CACHED ITEM QUERIES</small>
              <b>{cacheEntries}</b>
            </div>
          </article>

          <article>
            <span>
              <CheckCircle2 size={20} />
            </span>
            <div>
              <small>HEALTHY RECORDS</small>
              <b>{stats.healthy || 0}</b>
            </div>
          </article>

          <article>
            <span>
              <Database size={20} />
            </span>
            <div>
              <small>TOTAL RECORDS</small>
              <b>{stats.total || 0}</b>
            </div>
          </article>
        </section>

        <section className="query-bar">
          <div>
            <div className="eyebrow">
              QUERY KEY
            </div>
            <h2>
              ['items', '{category}']
            </h2>
          </div>

          <div className="tabs">
            {categories.map((item) => (
              <button
                key={item}
                className={
                  category === item ? 'active' : ''
                }
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <button
            className="primary"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending
              ? (
                <LoaderCircle
                  className="spin"
                  size={17}
                />
              )
              : <Plus size={17} />}
            Add demo record
          </button>
        </section>

        {notice && (
          <div className="notice">
            <CheckCircle2 size={17} />
            {notice}
          </div>
        )}

        <section className="performance-row">
          <article>
            <div className="metric-label">
              <span className="dot fresh" />
              Cache state
            </div>
            <b>
              {itemsQuery.isFetching
                ? 'Background refresh'
                : itemsQuery.isStale
                  ? 'Stale'
                  : 'Fresh'}
            </b>
            <small>
              Data can stay visible during refetch.
            </small>
          </article>

          <article>
            <div className="metric-label">
              <span className="dot" />
              Last server fetch
            </div>
            <b>
              {currentData?.fetchedAt
                ? timeAgo(currentData.fetchedAt)
                : '—'}
            </b>
            <small>
              Server timestamp from current query.
            </small>
          </article>

          <article>
            <div className="metric-label">
              <span className="dot" />
              React Query updated
            </div>
            <b>
              {itemsQuery.dataUpdatedAt
                ? timeAgo(itemsQuery.dataUpdatedAt)
                : '—'}
            </b>
            <small>
              Client-side cache update time.
            </small>
          </article>
        </section>

        <section className="data-panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">
                LIVE DATA VIEW
              </div>
              <h2>
                {category === 'all'
                  ? 'All operational metrics'
                  : `${category} metrics`}
              </h2>
            </div>

            <div className="fetch-state">
              {itemsQuery.isFetching && (
                <>
                  <LoaderCircle
                    className="spin"
                    size={15}
                  />
                  Refreshing in background
                </>
              )}

              {!itemsQuery.isFetching && (
                <>
                  <CheckCircle2 size={15} />
                  Cache ready
                </>
              )}
            </div>
          </div>

          {itemsQuery.isLoading ? (
            <div className="empty">
              <LoaderCircle
                className="spin"
                size={32}
              />
              <h3>Fetching initial data</h3>
              <p>
                This loader only appears when no cache exists.
              </p>
            </div>
          ) : itemsQuery.isError ? (
            <div className="empty error-state">
              <Server size={32} />
              <h3>Data request failed</h3>
              <p>
                {itemsQuery.error?.message ||
                  'Please retry.'}
              </p>
            </div>
          ) : (
            <div className="rows">
              {items.map((item) => {
                const trend =
                  Number(item.trend || 0);

                return (
                  <article
                    className="data-row"
                    key={item.id}
                  >
                    <span
                      className={`status-icon ${item.status}`}
                    >
                      <BarChart3 size={18} />
                    </span>

                    <div className="item-name">
                      <b>{item.title}</b>
                      <small>
                        {item.category} · {item.status}
                      </small>
                    </div>

                    <div className="item-value">
                      <b>
                        {formatNumber(item.value)}
                      </b>
                      <small>current value</small>
                    </div>

                    <div
                      className={
                        trend >= 0
                          ? 'trend positive'
                          : 'trend negative'
                      }
                    >
                      {trend >= 0
                        ? <TrendingUp size={16} />
                        : <TrendingDown size={16} />}
                      {trend >= 0 ? '+' : ''}
                      {trend.toFixed(2)}%
                    </div>

                    <div className="updated">
                      <b>
                        {timeAgo(item.updated_at)}
                      </b>
                      <small>updated</small>
                    </div>

                    <button
                      className="delete-button"
                      title="Delete demo record"
                      onClick={() =>
                        deleteMutation.mutate(item.id)
                      }
                      disabled={
                        deleteMutation.isPending
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="explain-grid">
          <article>
            <b>Request deduplication</b>
            <p>
              Components sharing the same query key reuse
              one in-flight request.
            </p>
          </article>

          <article>
            <b>Freshness window</b>
            <p>
              Data stays fresh for 30 seconds, reducing
              unnecessary network calls.
            </p>
          </article>

          <article>
            <b>Prefetching</b>
            <p>
              The next category is warmed in cache before
              you click it.
            </p>
          </article>

          <article>
            <b>Smart invalidation</b>
            <p>
              Mutations invalidate only relevant cached
              data and stats.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
