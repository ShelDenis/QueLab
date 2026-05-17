const API_BASE = 'http://192.168.31.17:8000';

// ✅ NativeScript-совместимая функция с таймаутом (без AbortController)
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 15000): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Таймаут запроса: сервер не ответил за ' + (timeoutMs/1000) + ' сек')), timeoutMs)
    )
  ]);
}

async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (response.ok) {
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as any;
    }
  } else {
    let msg = `Ошибка ${response.status}`;
    try {
      const err = JSON.parse(text);
      // ✅ FastAPI возвращает { detail: "..." } или { detail: [ {...} ] }
      if (err.detail) {
        if (Array.isArray(err.detail)) {
          // Валидационные ошибки: показываем первое поле
          msg = err.detail[0]?.msg || JSON.stringify(err.detail);
        } else {
          msg = String(err.detail);
        }
      } else {
        msg = JSON.stringify(err);
      }
    } catch {
      msg = text || msg;
    }
    console.error('❌ Backend error:', msg); // ← Теперь увидим реальную ошибку!
    throw new Error(msg);
  }
}

// Типы
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

export interface CreateQueuePayload {
  q_name: string;
  q_description: string;
  q_image?: string;      // base64 (опционально)
  q_image_filename?: string;
}

export interface QueueResponse {
  q_id: number;
  q_name: string;
  q_description: string;
  q_img_path: string | null;
  q_creator_id: number;
}

export interface QueueListItem {
  q_id: number;
  q_name: string;
  q_description: string;
  q_img_path: string | null;
  q_creator_id: number;
}

export interface UserProfile {
  user_id: number;
  user_name: string;
  email: string;
  avatar_url: string | null;
}

// ✅ API объект
export const api = {

  async login(credentials: LoginPayload): Promise<LoginResponse> {
    const response = await fetchWithTimeout(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse<LoginResponse>(response);
  },

  async register(payload: RegisterPayload): Promise<LoginResponse> {
    const response = await fetchWithTimeout(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<LoginResponse>(response);
  },

  // ✅ Загрузка аватара (base64) — NativeScript-совместимая
  async uploadUserAvatar(imageUri: string, token: string): Promise<{ path: string }> {
    console.log(`🔗 Загрузка аватара: ${imageUri}`);

    // 1. Конвертируем файл в base64 через ImageSource
    const { ImageSource } = require('@nativescript/core/image-source');

    // Используем sync-версию, чтобы избежать проблем с async/await в NS
    const imgSource = ImageSource.fromFileSync(imageUri);
    const base64Data = imgSource.toBase64String('jpeg', 85);

    if (!base64Data) {
      throw new Error('Не удалось обработать изображение');
    }

    // 2. Отправляем JSON на сервер
    const response = await fetchWithTimeout(`${API_BASE}/users/me/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        file: base64Data,
        filename: `user_avatar_${Date.now()}.jpg`
      })
    });

    console.log(`Ответ сервера: ${response.status}`);
    return handleResponse<{ path: string }>(response);
  },

  async createQueue(payload: CreateQueuePayload, token: string): Promise<QueueResponse> {
      console.log(`Создание очереди`);

      const response = await fetchWithTimeout(`${API_BASE}/queues`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log(`Ответ: ${response.status}`);
      return handleResponse<QueueResponse>(response);
    },

    async getActiveQueues(token: string): Promise<QueueListItem[]> {
      const response = await fetchWithTimeout(`${API_BASE}/queues`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return handleResponse<QueueListItem[]>(response);
    },

      async getProfile(token: string): Promise<UserProfile> {
        const response = await fetchWithTimeout(`${API_BASE}/users/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        return handleResponse<UserProfile>(response);
      }
};