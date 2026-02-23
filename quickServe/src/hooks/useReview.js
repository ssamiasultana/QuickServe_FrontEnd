import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import reviewService from '../services/reviewService';

// Create a review
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewData) => reviewService.createReview(reviewData),
    onSuccess: (response, variables) => {
      // Normalize review from API response
      const review = response?.data || response;

      // Optimistically update the booking-specific review cache
      if (variables?.booking_id) {
        queryClient.setQueryData(
          ['reviews', 'booking', variables.booking_id],
          review
        );
      }

      // Invalidate related review and worker/booking queries to refetch in background
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });

      toast.success('Review submitted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit review');
    },
  });
};

// Get reviews for a worker
export const useGetWorkerReviews = (workerId, options = {}) => {
  return useQuery({
    queryKey: ['reviews', 'worker', workerId],
    queryFn: async () => {
      const response = await reviewService.getWorkerReviews(workerId);
      return response.data || response;
    },
    enabled: !!workerId && (options.enabled !== false),
    ...options,
  });
};

// Get review for a booking
export const useGetBookingReview = (bookingId, options = {}) => {
  return useQuery({
    queryKey: ['reviews', 'booking', bookingId],
    queryFn: async () => {
      const response = await reviewService.getBookingReview(bookingId);
      return response.data || response;
    },
    enabled: !!bookingId && (options.enabled !== false),
    ...options,
  });
};
