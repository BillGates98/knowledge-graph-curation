import apiClient from "@/api/axios";

const prefix: string = '/subjects';

const SubjectService = {

  getAll(startThreshold: number, endThreshold: number, page: number, lastId: number, action: string): Promise<any> {
    return apiClient.get(prefix + '/all', { params: { startThreshold, endThreshold, page, lastId, action } });
  },

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

export default SubjectService;