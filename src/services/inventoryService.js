import api from '@/services/api';

const inventoryService = {
  // Receiving Reports
  getReceivingReports(params = {}) {
    return api.get('/inventory/receiving-reports', { params });
  },

  getReceivingReport(id) {
    return api.get(`/inventory/receiving-reports/${id}`);
  },

  createReceivingReport(data) {
    return api.post('/inventory/receiving-reports', data);
  },

  updateReceivingReport(id, data) {
    return api.put(`/inventory/receiving-reports/${id}`, data);
  },

  submitReceivingReport(id) {
    return api.post(`/inventory/receiving-reports/${id}/submit`);
  },

  confirmReceivingReport(id) {
    return api.post(`/inventory/receiving-reports/${id}/confirm`);
  },

  cancelReceivingReport(id) {
    return api.post(`/inventory/receiving-reports/${id}/cancel`);
  },

  deleteReceivingReport(id) {
    return api.delete(`/inventory/receiving-reports/${id}`);
  },

  exportReceivingReports(params = {}) {
    return api.get('/inventory/receiving-reports-export', { params });
  },

  getStatistics() {
    return api.get('/inventory/statistics');
  },
};

export default inventoryService;
