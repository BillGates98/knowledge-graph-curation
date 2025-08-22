import apiClient from "@/api/axios";

const prefix: string = '/configurations';

const ConfigurationService = {

  getById(id: string): Promise<any> {
    return apiClient.get(`${prefix}/${id}`);
  },

  create(data: any): Promise<any> {
    return apiClient.post(prefix, data);
  },

  update(data: any): Promise<any> {
    return apiClient.put(`${prefix}/${data.id}`, data);
  },

  delete(id: string): Promise<void> {
    return apiClient.delete(`${prefix}/${id}`);
  },

  getDashboard(): Promise<any> {
    return apiClient.get(`${prefix}/dashboard`);
  }
};

export default ConfigurationService;