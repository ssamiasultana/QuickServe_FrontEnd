import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

// Get user profile
export const useGetUserProfile = (options = {}) => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const response = await authService.getProfile();
      return response.data || response;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

// Update user profile
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => authService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
};