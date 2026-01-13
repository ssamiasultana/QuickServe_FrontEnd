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

export const useGetAllBookings = (options = {}) => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const response = await bookingService.getAllBookings();
      return response.data || response;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

// Get all bookings for the authenticated worker
export const useGetWorkerBookings = (options = {}) => {
  return useQuery({
    queryKey: ['workerBookings'],
    queryFn: async () => {
      const response = await bookingService.getWorkerBookings();
      return response.data || response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    ...options,
  });
};

// Update booking status (confirm or cancel) - for workers
export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, status }) =>
      bookingService.updateBookingStatus(bookingId, status),
    onSuccess: (response, variables) => {
      // Invalidate all booking queries to refresh data
      // This will refresh worker bookings, customer bookings, and all bookings
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['workerBookings'] });

      const statusText =
        variables.status === 'confirmed' ? 'confirmed' : 'cancelled';
      toast.success(`Booking ${statusText} successfully`);
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to update booking status');
    },
  });
};
