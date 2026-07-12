const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  role?: string;
}

export interface Profile extends User {
  organizations: Organization[];
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error?.message ?? 'Request failed');
  }

  return body.data as T;
}

export const authApi = {
  register(input: { name: string; email: string; password: string }) {
    return request<{ user: User; organization: Organization }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  login(input: { email: string; password: string }) {
    return request<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  logout() {
    return request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  },

  getMe() {
    return request<Profile>('/users/me');
  },

  updateProfile(input: { name?: string; avatarUrl?: string | null }) {
    return request<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
};
