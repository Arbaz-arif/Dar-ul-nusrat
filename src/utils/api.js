const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request(method, endpoint, data = null) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await fetch(config.url, {
        method: config.method,
        headers: config.headers,
        body: data ? JSON.stringify(data) : undefined
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'API Error');
      }

      return responseData;
    } catch (error) {
      throw error;
    }
  }

  // Auth endpoints
  login(email, password) {
    return this.request('POST', '/auth/login', { email, password });
  }

  register(memberData) {
    return this.request('POST', '/auth/register', memberData);
  }

  refreshToken(refreshToken) {
    return this.request('POST', '/auth/refresh-token', { refreshToken });
  }

  logout() {
    return this.request('POST', '/auth/logout');
  }

  getCurrentUser() {
    return this.request('GET', '/auth/me');
  }

  // Upload endpoints
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${this.baseURL}/upload/image`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: formData
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Image upload failed');
    return data;
  }

  // Member endpoints
  createMember(memberData) {
    return this.request('POST', '/members', memberData);
  }

  getMember(id) {
    return this.request('GET', `/members/${id}`);
  }

  updateMember(id, updateData) {
    return this.request('PUT', `/members/${id}`, updateData);
  }

  deleteMember(id) {
    return this.request('DELETE', `/members/${id}`);
  }

  getMembersByDepartment(department, filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request('GET', `/members/department/${department}?${params}`);
  }

  searchMembers(searchTerm, department = null, filters = {}) {
    const params = new URLSearchParams({ ...filters, searchTerm });
    if (department) params.append('department', department);
    return this.request('GET', `/members?${params}`);
  }

  // Admin endpoints
  createAdmin(adminData) {
    return this.request('POST', '/admin', adminData);
  }

  getAllAdmins() {
    return this.request('GET', '/admin');
  }

  getAdminsByDepartment(department) {
    return this.request('GET', `/admin/department/${department}`);
  }

  getSuperAdminDashboard() {
    return this.request('GET', '/admin/dashboard/super');
  }

  getDepartmentAdminDashboard(department) {
    return this.request('GET', `/admin/dashboard/department/${department}`);
  }

  getLajnaAdminDashboard() {
    return this.request('GET', '/admin/dashboard/lajna');
  }

  getSadarDashboard() {
    return this.request('GET', '/admin/dashboard/sadar');
  }

  // Muntazim endpoints
  getAllMuntazims() {
    return this.request('GET', '/muntazim');
  }

  getMuntazim(id) {
    return this.request('GET', `/muntazim/${id}`);
  }

  getMuntazimMembers(muntazimName) {
    return this.request('GET', `/muntazim/${muntazimName}/members`);
  }

  getZaeemDashboard() {
    return this.request('GET', '/muntazim/dashboard/zaeem');
  }

  getMuntazimHeadDashboard(muntazimName) {
    return this.request('GET', `/muntazim/dashboard/head?muntazimName=${muntazimName}`);
  }
}

const instance = new ApiClient();
export default instance;
