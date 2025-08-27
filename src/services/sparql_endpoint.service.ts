import apiClient from "@/api/axios";

const prefix: string = '/sparql-endpoints';

const SparqlEndpointService = {

  fetchAll(): Promise<any> {
    return apiClient.get(`${prefix}/list-endpoints`);
  },
  
  create(data: any): Promise<any> {
    return apiClient.post(prefix + '/create', data);
  },

  update(data: any): Promise<any> {
    return apiClient.put(`${prefix}/update?id=${data.id}`, data);
  },

  delete(id: string): Promise<void> {
    return apiClient.delete(`${prefix}/delete?id=${id}`);
  }
};

export default SparqlEndpointService;