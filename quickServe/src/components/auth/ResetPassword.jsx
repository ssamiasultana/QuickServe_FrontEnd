import { Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router';
import { useResetPassword, useVerifyToken } from '../../hooks/usePassword';
import { FormInput } from '../ui/FormInput';
export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const navigate = useNavigate();
  const { token } = useParams();

  const {
    data: verifyData,
    isLoading: verifying,
    isError: verifyError,
  } = useVerifyToken(token);
  const resetPasswordMutation = useResetPassword();

  useEffect(() => {
    if (verifyError) {
      toast.error('Invalid or expired reset link');
      navigate('/forgot-password');
    }
  }, [verifyError, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (password !== passwordConfirmation) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const response = await resetPasswordMutation.mutateAsync({
        token,
        password,
        password_confirmation: passwordConfirmation,
      });

      if (response.success) {
        navigate('/login');
      }
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const email = verifyData?.email || '';

  if (verifying) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Verifying reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position='top-right'
        reverseOrder={false}
        toastOptions={{
          success: { duration: 3000 },
          error: { duration: 5000 },
        }}
      />
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          <div>
            <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
              Reset Password
            </h2>
            <p className='mt-2 text-center text-sm text-gray-600'>
              Enter your new password for {email}
            </p>
          </div>

          <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
            <div className='space-y-4'>
              <div>
                <FormInput
                  label='Password'
                  name='password'
                  type='password'
                  placeholder='Password'
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={resetPasswordMutation.isPending}
                  icon={Lock}
                />
              </div>

              <div>
                <FormInput
                  label='Confirm Password'
                  name='password_confirmation'
                  type='password'
                  placeholder='Confirm New Password'
                  required
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  disabled={resetPasswordMutation.isPending}
                  icon={Lock}
                />
              </div>
            </div>

            <div>
              <button
                type='submit'
                disabled={resetPasswordMutation.isPending}
                className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'>
                {resetPasswordMutation.isPending
                  ? 'Resetting...'
                  : 'Reset Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
