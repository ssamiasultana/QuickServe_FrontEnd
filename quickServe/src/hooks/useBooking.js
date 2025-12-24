import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import bookingService from '../services/bookingService';

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingData) => bookingService.createBooking(bookingData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking request has been sent successfully');
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to create booking');
    },
  });
};

// Get all bookings for a customer by customerId
export const useGetCustomerBookings = (customerId, options = {}) => {
  return useQuery({
    queryKey: ['bookings', customerId],
    enabled: !!customerId,
    queryFn: async () => {
      const response = await bookingService.getCustomerBookings(customerId);
      // Backend returns { success, data: [...], total_bookings }
      return response.data ?? response;
    },
    ...options,
  });
};
