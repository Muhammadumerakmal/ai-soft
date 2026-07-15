// NOTE: this script has not been run against a real deployed target in this
// environment — validate locally with 'k6 run k6/health.js' before relying
// on the thresholds below.
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001/api/v1';

export const options = {
  vus: 20,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<200'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/health`);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'body reports ok': (r) => JSON.parse(r.body).data.status === 'ok',
  });
  sleep(1);
}
