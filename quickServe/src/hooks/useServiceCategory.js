import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

export const useGetSubServices = () => {
  return useQuery({
    queryKey: ['subServices'],
    queryFn: async () => {
      const response = await workerService.getSubServices();
      return response.data || response;
    },
  });
};

export const useCreateSubServices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subServiceData) =>
      workerService.postSubServices(subServiceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subServices'] });
      toast.success('Sub Services created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create worker');
    },
  });
};
