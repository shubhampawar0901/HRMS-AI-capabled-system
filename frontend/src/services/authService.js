import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';
import { apiRequest } from '@/api/interceptors';

class AuthService {
  // Login user
  async login(credentials) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, credentials),
      'auth-login'
    );
  }



  // Logout user
  async logout() {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT),
      'auth-logout'
    );
  }

  // Refresh token
  async refreshToken(refreshToken) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken }),
      'auth-refresh'
    );
  }

  // Get user profile
  async getProfile() {
    return apiRequest(
      () => axiosInstance.get(API_ENDPOINTS.AUTH.PROFILE),
      'auth-profile'
    );
  }

  // Update user profile
  async updateProfile(profileData) {
    return apiRequest(
      () => axiosInstance.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, profileData),
      'auth-update-profile'
    );
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // Get current user token
  getToken() {
    return localStorage.getItem('token');
  }

  // Get refresh token
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  // Clear authentication data
  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // Store authentication data
  storeAuth(authData) {
    if (authData.token) {
      localStorage.setItem('token', authData.token);
    }
    if (authData.refreshToken) {
      localStorage.setItem('refreshToken', authData.refreshToken);
    }
    if (authData.user) {
      localStorage.setItem('user', JSON.stringify(authData.user));
    }
  }

  // Get stored user data
  getStoredUser() {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.warn('Failed to parse user data from localStorage:', error);
      localStorage.removeItem('user'); // Remove corrupted data
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;
