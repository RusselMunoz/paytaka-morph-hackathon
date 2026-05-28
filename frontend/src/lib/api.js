import { API_BASE_URL } from './config';

let authToken;

export const setAuthToken = (token) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

const buildUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

export async function apiRequest(path, options = {}) {
  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...options.headers,
  };

  let response;

  try {
    response = await fetch(buildUrl(path), {
      ...options,
      headers,
      body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
    });
  } catch (error) {
    throw new Error(
      `Could not reach the backend at ${API_BASE_URL}. Check EXPO_PUBLIC_API_URL and make sure the API server is running.`
    );
  }

  const text = await response.text();
  const data = text
    ? (() => {
        try {
          return JSON.parse(text);
        } catch {
          return { message: text };
        }
      })()
    : null;

  if (!response.ok) {
    const error = new Error(data?.message ?? 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const authApi = {
  register: ({ email, password, displayName, phone, role }) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: { email, password, displayName, phone, role },
    }),
  login: ({ email, password }) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),
};

export const walletApi = {
  getBalance: (address) => apiRequest(`/wallets/${address}/balance`),
  saveWallet: ({ address, provider = 'EXTERNAL', label }) =>
    apiRequest('/wallets', {
      method: 'POST',
      body: { address, provider, label },
    }),
};

export const aiApi = {
  advise: ({ message, context }) =>
    apiRequest('/ai/advise', {
      method: 'POST',
      body: { message, context },
    }),
};

export const remittanceApi = {
  list: () => apiRequest('/remittances'),
  createDraft: ({ recipientId, amount, memo, fromAddress, toAddress }) =>
    apiRequest('/remittances', {
      method: 'POST',
      body: { recipientId, amount, memo, fromAddress, toAddress },
    }),
  submit: ({ transactionId, txHash }) =>
    apiRequest(`/remittances/${transactionId}/submit`, {
      method: 'POST',
      body: { txHash },
    }),
};

export const qrApi = {
  parse: (rawPayload) =>
    apiRequest('/qr/parse', {
      method: 'POST',
      body: { rawPayload },
    }),
  createPaymentIntent: ({ rawPayload, fromAddress, merchantAddress, amount }) =>
    apiRequest('/qr/payment-intents', {
      method: 'POST',
      body: { rawPayload, fromAddress, merchantAddress, amount },
    }),
};

export const budgetApi = {
  list: () => apiRequest('/budgets'),
  create: ({ name, category, limitAmount, startsAt, endsAt, period }) =>
    apiRequest('/budgets', {
      method: 'POST',
      body: { name, category, limitAmount, startsAt, endsAt, period },
    }),
};
