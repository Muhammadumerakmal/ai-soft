// NOTE: this script has not been run against a real deployed target in this
// environment — validate locally with 'k6 run k6/projects-list.js' before
// relying on the thresholds below. Requires a real test account to exist.
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001/api/v1';
const TEST_EMAIL = __ENV.TEST_EMAIL || 'test@test.com';
const TEST_PASSWORD = __ENV.TEST_PASSWORD || 'Test123!';

export const options = {
  vus: 20,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<200'],
    http_req_failed: ['rate<0.01'],
  },
};

export function setup() {
  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  const accessToken = JSON.parse(res.body).data?.accessToken;
  if (!accessToken) {
    throw new Error('setup() login failed — check TEST_EMAIL/TEST_PASSWORD against the target environment');
  }
  return { accessToken };
}

export default function (data) {
  const res = http.get(`${BASE_URL}/projects`, {
    headers: { Authorization: `Bearer ${data.accessToken}` },
  });
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
