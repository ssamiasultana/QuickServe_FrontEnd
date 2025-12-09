import { useQuery } from '@tanstack/react-query';
import customerService from '../services/customerService';

// Get all customers query
export const useGetAllCustomers = (options = {}) => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await customerService.getAllCustomer();
      return response.data || response;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};
