import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import passwordService from '../services/passwordService';

// Forgot password mutation
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email) => passwordService.forgotPassword(email),
    onSuccess: (data) => {
      toast.success(data.message || 'Password reset email sent successfully!');
      return data;
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send password reset email');
      throw error;
    },
  });
};

// Verify token query
export const useVerifyToken = (token, options = {}) => {
  return useQuery({
    queryKey: ['password', 'verify-token', token],
    queryFn: async () => {
      const response = await passwordService.verifyToken(token);
      return response;
    },
    enabled: !!token && options.enabled !== false,
    retry: false,
    ...options,
  });
};

// Reset password mutation
export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, password, password_confirmation }) =>
      passwordService.resetPassword(token, password, password_confirmation),
    onSuccess: (data) => {
      toast.success(data.message || 'Password reset successfully!');
      return data;
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reset password');
      throw error;
    },
  });
};
