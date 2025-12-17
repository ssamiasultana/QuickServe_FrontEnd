import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import workerService from '../services/workerService';

export const useWorkers = () => {
  return useQuery({
    queryKey: ['workers'],
    queryFn: async () => {
      const response = await workerService.getAllWorkers();
      return response.data || response;
    },
  });
};

export const usePaginatedWorkers = (page, limit) => {
  return useQuery({
    queryKey: ['workers', 'paginated', page, limit],
    queryFn: async () => {
      const response = await workerService.getPaginatedWorkers(page, limit);
      return response.data || response;
    },
  });
};
export const useSearchWorkers = (searchParams, options = {}) => {
  return useQuery({
    queryKey: ['workers', 'search', searchParams?.toLowerCase()?.trim()],
    queryFn: async () => {
      const response = await workerService.searchWorkers(searchParams);
      return response.data || response;
    },
    enabled: options.enabled ?? !!searchParams?.trim(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    ...options,
  });
};

// Create worker
export const useCreateWorker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workerData) => workerService.createWorker(workerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      toast.success('Worker created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create worker');
    },
  });
};

// Update worker
export const useUpdateWorker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => workerService.updateWorker(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      toast.success('Worker updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update worker');
    },
  });
};

// Delete worker
export const useDeleteWorker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => workerService.deleteWorker(id),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      toast.success('Worker deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete worker');
    },
  });
};

// Get single worker
export const useGetSingleWorker = (id, options = {}) => {
  return useQuery({
    queryKey: ['workers', id],
    queryFn: async () => {
      const response = await workerService.getSingleWorker(id);
      return response.data || response;
    },
    enabled: !!id && options.enabled !== false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

// Check worker profile
export const useCheckWorkerProfile = (options = {}) => {
  return useQuery({
    queryKey: ['workers', 'profile', 'check'],
    queryFn: async () => {
      const response = await workerService.checkWorkerProfile();
      return response.data || response;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

// Get services
export const useGetServices = (options = {}) => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await workerService.getServices();
      return response.data || response;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

// Create service
export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceData) => workerService.createService(serviceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service created successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create service');
    },
  });
};

// Update service
export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => workerService.updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update service');
    },
  });
};

// Delete service
export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => workerService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete service');
    },
  });
};

// In useWorker.js, ensure getServices returns an array of {id, name}
export const useGetWorkerByServices = (options = {}) => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await workerService.getServices();
      // Ensure response.data is an array of {id, name} objects
      const services = response.data || response;
      if (Array.isArray(services)) {
        return services.map((service) => ({
          id: service.id,
          name: service.name || service.service_name || 'Unknown',
        }));
      }
      return [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};
