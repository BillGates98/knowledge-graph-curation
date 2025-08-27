import apiClient from "@/api/axios";

const prefix: string = '/knowledge-graphs';

const KnowledgeGraphService = {

  fetchKgs(sparqlEndpoint: string): Promise<any> {
    return apiClient.post(`${prefix}/fetch-kgs`, {sparqlEndpoint});
  },

  updateComputationStatus(data: any): Promise<any> {
    return apiClient.put(`${prefix}/update-computation-status`, data);
  },

  getComputationStatus(): Promise<any> {
    return apiClient.get(`${prefix}/computation-status`);
  },

  listKnowledgeGraphs(): Promise<any> {
    return apiClient.get(`${prefix}/list-kgs`);
  },

  delete(id: string): Promise<void> {
    return apiClient.delete(`${prefix}/delete?id=${id}`);
  },

  listKgs(): Promise<any> {
    return apiClient.get(`${prefix}/list-kgs`);
  }
};

export default KnowledgeGraphService;