import Cookies from 'js-cookie';

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return Cookies.get('token') || null;
};

export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
  return {
    'Content-Type': 'application/json',
  };
}; 