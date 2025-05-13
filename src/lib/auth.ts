"use client";

// 用于存储认证令牌的键名
const TOKEN_KEY = 'auth_token';

// 存储认证令牌到localStorage
export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

// 从localStorage获取认证令牌
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

// 清除认证令牌
export function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// 检查用户是否已登录
export function isLoggedIn(): boolean {
  return !!getToken();
}

// 获取当前用户信息
export async function getCurrentUser() {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('未登录');
    }

    const response = await fetch(
      process.env.NEXT_PUBLIC_DEV 
        ? `${process.env.NEXT_PUBLIC_API_URL_DEV}/auth/user` 
        : "/auth/user",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        // 授权失败，清除本地令牌
        clearToken();
      }
      throw new Error('获取用户信息失败');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('获取用户信息时出错:', error);
    return null;
  }
}

// 登录函数
export async function login(email: string, password: string) {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_DEV 
        ? `${process.env.NEXT_PUBLIC_API_URL_DEV}/auth/login` 
        : "/auth/login",
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!response.ok) {
      throw new Error('登录失败');
    }

    const data = await response.json();
    
    // 存储令牌
    if (data.token) {
      setToken(data.token);
      return { success: true, user: data.user };
    } else {
      throw new Error('未收到有效的授权令牌');
    }
  } catch (error) {
    console.error('登录时出错:', error);
    return { success: false, error: error instanceof Error ? error.message : '登录失败' };
  }
}

// 注册函数
export async function register(email: string, password: string) {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_DEV 
        ? `${process.env.NEXT_PUBLIC_API_URL_DEV}/auth/register` 
        : "/auth/register",
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!response.ok) {
      throw new Error('注册失败');
    }

    const data = await response.json();
    
    // 如果注册后立即登录，存储令牌
    if (data.token) {
      setToken(data.token);
      return { success: true, user: data.user };
    }
    
    return { success: true };
  } catch (error) {
    console.error('注册时出错:', error);
    return { success: false, error: error instanceof Error ? error.message : '注册失败' };
  }
}

// 登出函数
export async function logout() {
  try {
    // 清除本地令牌
    clearToken();
    
    // 调用登出API（可选，取决于你的后端实现）
    try {
      await fetch(
        process.env.NEXT_PUBLIC_DEV 
          ? `${process.env.NEXT_PUBLIC_API_URL_DEV}/auth/logout` 
          : "/auth/logout",
        { method: 'POST' }
      );
    } catch (error) {
      // 即使API调用失败，我们仍然认为本地登出成功
      console.warn('登出API调用失败，但本地登出成功', error);
    }
    
    return { success: true };
  } catch (error) {
    console.error('登出时出错:', error);
    return { success: false, error: error instanceof Error ? error.message : '登出失败' };
  }
} 