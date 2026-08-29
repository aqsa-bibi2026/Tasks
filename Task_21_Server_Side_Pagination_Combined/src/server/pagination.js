export function parsePagination(query) {
  const p = Number.parseInt(query.page,10);
  const l = Number.parseInt(query.limit,10);
  const page = Number.isFinite(p) && p > 0 ? p : 1;
  const allowed = new Set([5,10,20,50]);
  const limit = allowed.has(l) ? l : 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { page, limit, from, to };
}
export function buildPaginationMeta({page,limit,total}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page, limit, total, totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
    from: total === 0 ? 0 : (page - 1) * limit + 1,
    to: total === 0 ? 0 : Math.min(page * limit, total)
  };
}
