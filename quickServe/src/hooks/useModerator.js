import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import moderatorService from '../services/moderatorService';

// Get all moderators query
export const useGetAllModerators = (options = {}) => {
  return useQuery({
    queryKey: ['moderators'],
    queryFn: async () => {
      const response = await moderatorService.getAllModerators();
      return response.data || response;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

// Get paginated moderators query
export const useGetPaginatedModerators = (page = 1, perPage = 10, options = {}) => {
  return useQuery({
    queryKey: ['moderators', 'paginated', page, perPage],
    queryFn: async () => {
      const response = await moderatorService.getPaginatedModerators(page, perPage);
      return response;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

// Get single moderator query
export const useGetSingleModerator = (id, options = {}) => {
  return useQuery({
    queryKey: ['moderators', id],
    queryFn: async () => {
      const response = await moderatorService.getSingleModerator(id);
      return response.data || response;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

// Update moderator mutation
export const useUpdateModerator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => moderatorService.updateModerator(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderators'] });
      toast.success('Moderator updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update moderator');
    },
  });
};

// Delete moderator mutation
export const useDeleteModerator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => moderatorService.deleteModerator(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderators'] });
      toast.success('Moderator deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete moderator');
    },
  });
};
