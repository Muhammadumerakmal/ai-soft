// NOTE: this script has not been run against a real deployed target in this
// environment — validate locally with 'k6 run k6/login.js' before relying
// on the thresholds below. Requires a real test account to already exist.
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001/api/v1';
const TEST_EMAIL = __ENV.TEST_EMAIL || 'test@test.com';
const TEST_PASSWORD = __ENV.TEST_PASSWORD || 'Test123!';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<200'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(res, {
    'status is 200': (r) => r.status === 200,
    'returns an access token': (r) => Boolean(JSON.parse(r.body).data?.accessToken),
  });
  sleep(1);
}
