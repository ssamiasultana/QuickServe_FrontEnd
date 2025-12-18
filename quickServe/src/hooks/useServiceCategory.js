import workerService from '../services/workerService';

export const useGetServiceCategory = (serviceId, options = {}) => {
  return useQuery({
    queryKey: ['serviceCategory', serviceId],
    queryFn: async () => {
      const response = await workerService.getServicecategoryById(serviceId);
      return response.data || response;
    },
    enabled: !!serviceId && options.enabled !== false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};
