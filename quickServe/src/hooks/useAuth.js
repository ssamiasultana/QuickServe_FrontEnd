import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import authService from '../services/authService';

// Sign up mutation
export const useSignUp = () => {
  return useMutation({
    mutationFn: (userData) => authService.signUp(userData),
    onSuccess: (data) => {
      toast.success('Account created successfully!');
      return data;
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create account');
      throw error;
    },
  });
};

// Login mutation
export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (data) => {
      toast.success('Login successful!');
      return data;
    },
    onError: (error) => {
      toast.error(
        error.message || 'Login failed. Please check your credentials.'
      );
      throw error;
    },
  });
};

// Get all users query
export const useGetAllUsers = (options = {}) => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await authService.getAllUsers();
      return response.data || response;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};
