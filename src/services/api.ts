// ⚠️ Замените на адрес вашего бэкенда
// Для эмулятора Android: используйте 10.0.2.2 вместо localhost
// Для iOS симулятора: используйте localhost
// Для реального устройства: IP-адрес компьютера в той же сети
const API_BASE = 'http://192.168.31.17:8000';

export interface LoginResponse {
  access_token: string;
  user_id: number;
  user_name: string;
}

export interface LoginPayload {
  u_mail: string;
  u_pswrd: string;
}

export interface RegisterPayload {
  u_name: string;
  u_surname: string;
  u_mail: string;
  u_pswrd: string;
}

export const api = {
  async login(credentials: LoginPayload): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse<LoginResponse>(response);
  },

  async register(payload: RegisterPayload): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<LoginResponse>(response);
  }
};

async function handleResponse<T>(response: Response): Promise<T> {
  const responseText = await response.text();

  if (response.ok) {
    try {
      return JSON.parse(responseText) as T;
    } catch {
      return responseText as any;
    }
  } else {
    let errorDetail = `Ошибка ${response.status}`;
    try {
      const errorData = JSON.parse(responseText);
      errorDetail = errorData.detail || errorDetail;
    } catch {}
    throw new Error(errorDetail);
  }
}