let apiRequests = 0;

export function countApiRequest(req, res, next) {
  if (
    req.path !== '/health' &&
    req.path !== '/health/db' &&
    req.path !== '/metrics'
  ) {
    apiRequests += 1;
  }

  next();
}

export function getRequestCount() {
  return apiRequests;
}
