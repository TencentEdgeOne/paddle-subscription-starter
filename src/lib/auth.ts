"use client";

// Key name for storing authentication token
const TOKEN_KEY = 'auth_token';

// Store authentication token in localStorage
export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

// Get authentication token from localStorage
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

// Clear authentication token
export function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// Check if user is logged in
export function isLoggedIn(): boolean {
  return !!getToken();
}

// Get current user information
export async function getCurrentUser() {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // Call the API to get user information
    const response = await fetch(
      `/api/auth/user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (!response.ok) {
      if (response.status === 401) {
        // Authorization failed, clear local token
        clearToken();
        throw new Error('Invalid or expired session');
      }
      throw new Error('Failed to get user information');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting user information:', error);
    throw error;
  }
}

export async function login(email: string, password: string) {
  try {
    // Call authentication API
    const response = await fetch(
      `/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
    
    const data = await response.json();
    
    // Store token locally
    if (data.token) {
      setToken(data.token);
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function register(email: string, password: string, name: string) {
  try {
    // Call registration API
    const response = await fetch(
      `/api/auth/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    
    const data = await response.json();
    
    // Store token if automatically logged in
    if (data.token) {
      setToken(data.token);
    }
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Logout function
export async function logout() {
  try {
    // Clear local token
    clearToken();
    
    // Call logout API (optional, depends on your backend implementation)
    try {
      await fetch(
        `/api/auth/logout`,
        { method: 'POST' }
      );
    } catch (error) {
      // Even if API call fails, we still consider local logout successful
      console.warn('Logout API call failed, but local logout successful', error);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error during logout:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Logout failed' };
  }
} 