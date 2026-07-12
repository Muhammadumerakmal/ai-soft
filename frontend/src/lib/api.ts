const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface ApiOptions extends RequestInit {
  params?: Record<string, string>;
}

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { params, ...init } = options;
  let url = `${API_URL}${path}`;

  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const response = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, await response.json());
  }

  return response.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API Error: ${status}`);
    this.name = 'ApiError';
  }
}

export const api = {
  get<T>(path: string, options?: ApiOptions) {
    return request<T>(path, { ...options, method: 'GET' });
  },
  post<T>(path: string, body?: unknown, options?: ApiOptions) {
    return request<T>(path, { ...options, method: 'POST', body: JSON.stringify(body) });
  },
  put<T>(path: string, body?: unknown, options?: ApiOptions) {
    return request<T>(path, { ...options, method: 'PUT', body: JSON.stringify(body) });
  },
  delete<T>(path: string, options?: ApiOptions) {
    return request<T>(path, { ...options, method: 'DELETE' });
  },
};
