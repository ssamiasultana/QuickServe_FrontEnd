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
// export const useSearchWorkers = (searchParams) => {
//   return useQuery({
//     queryKey: ["workers", "search", searchParams],
//     queryFn: async () => {
//       const response = await workerService.searchWorkers(searchParams);
//       return response.data || response;
//     },
//     enabled: !!searchParams, // Only run if searchParams exists
//   });
// };

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
