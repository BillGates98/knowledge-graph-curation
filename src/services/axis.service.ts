import apiClient, { WEB_SERVICE_URL } from "@/api/axios";

// const prefix: string = '/subjects';

const axisPrefixes: any = {
  'subject': 'subjects',
  'predicate': 'predicates',
  'object': 'objects'
};

const AxisService = {

  getSimilarSubjects(prefix: string, minScore: number, maxScore: number, limit: number, page: number, kgName: string): Promise<any> {
    return apiClient.get(axisPrefixes[prefix] + '/list-sim', { params: { minScore, maxScore, limit, page, kgName } });
  },

  fetch(prefix: string, kgName: string): Promise<any> {
    return apiClient.post(`${axisPrefixes[prefix]}/fetch`, { kgName });
  },

  computeSimilarities(prefix: string, kgName: string): Promise<any> {
    return apiClient.post(`${axisPrefixes[prefix]}/compute-similarities`, { kgName });
  },

  update(prefix: string, data: any): Promise<any> {
    return apiClient.put(`${axisPrefixes[prefix]}/${data.id}`, data);
  },

  listSimilarities(prefix: string, data: any): Promise<any> {
    return apiClient.get(`${axisPrefixes[prefix]}/list-sim`, { params: data });
  },

  countResults(prefix: string, data: any): Promise<any> {
    return apiClient.get(`${axisPrefixes[prefix]}/count-results`, { params: data });
  },

  generateCorrespondences(prefix: string, data: any): Promise<any> {
    return apiClient.get(`${axisPrefixes[prefix]}/generate-correspondences`, { params: data });
  },

  downloadFile(prefix: string, data: any): any {
    return WEB_SERVICE_URL + `/${axisPrefixes[prefix]}/download-file?filePath=${data.filePath}`;
  },

  deleteBunch(prefix: string, data: any): Promise<void> {
    return apiClient.delete(`${axisPrefixes[prefix]}/delete-sim`, { params: data });
  },

  delete(prefix: string, id: string): Promise<void> {
    return apiClient.delete(`${axisPrefixes[prefix]}/delete?id=${id}`);
  },
};

export default AxisService;