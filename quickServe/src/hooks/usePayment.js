import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import paymentService from '../services/paymentService';

// Worker: Submit commission payment (30% to admin)
export const useSubmitCommissionPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => paymentService.submitCommissionPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workerTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['workerBookings'] });
      
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to submit commission payment');
    },
  });
};

// Worker: Initiate SSL Commerz payment
export const useInitiateSslCommerzPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId) => paymentService.initiateSslCommerzPayment(bookingId),
    onSuccess: (data) => {
      // Redirect to SSL Commerz payment page
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        toast.error('Payment URL not received');
      }
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to initiate payment');
    },
  });
};

// Worker: Get transactions
export const useGetWorkerTransactions = () => {
  return useQuery({
    queryKey: ['workerTransactions'],
    queryFn: async () => {
      const response = await paymentService.getWorkerTransactions();
      return response.data || response;
    },
  });
};

// Admin: Get pending commission payments
export const useGetPendingCommissionPayments = () => {
  return useQuery({
    queryKey: ['pendingCommissionPayments'],
    queryFn: async () => {
      const response = await paymentService.getPendingCommissionPayments();
      return response.data || response;
    },
  });
};

// Admin: Process commission payment
export const useProcessCommissionPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transactionId, action, notes }) =>
      paymentService.processCommissionPayment(transactionId, action, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendingCommissionPayments'] });
      queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
      toast.success(`Commission payment ${variables.action}d successfully`);
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to process commission payment');
    },
  });
};

// Admin: Get pending online payments
export const useGetPendingOnlinePayments = () => {
  return useQuery({
    queryKey: ['pendingOnlinePayments'],
    queryFn: async () => {
      const response = await paymentService.getPendingOnlinePayments();
      return response.data || response;
    },
  });
};

// Admin: Send online payment
export const useSendOnlinePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, notes }) =>
      paymentService.sendOnlinePayment(bookingId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingOnlinePayments'] });
      queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
      toast.success('Online payment sent to worker successfully');
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to send online payment');
    },
  });
};

// Admin: Get all transactions
export const useGetAllTransactions = () => {
  return useQuery({
    queryKey: ['allTransactions'],
    queryFn: async () => {
      const response = await paymentService.getAllTransactions();
      return response.data || response;
    },
  });
};
