// components/auth/Login.jsx
import { useQueryClient } from '@tanstack/react-query';
import { Lock, Mail } from 'lucide-react';
import { use, useActionState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import logo from '../../assets/logo.png';
import { loginAction } from '../../utils/authAction';
import { AuthContext } from '../Context/AuthContext';
import Card from '../ui/Card';
import colors from '../ui/color';
import { FormInput } from '../ui/FormInput';

const Login = () => {
  const { login, isAuthenticated, user } = use(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role.toLowerCase();
      switch (role) {
        case 'admin':
        case 'moderator':
          navigate('/dashboard', { replace: true });
          break;
        case 'worker':
          navigate('/worker', { replace: true });
          break;
        case 'customer':
          navigate('/customer', { replace: true });
          break;
        default:
          break;
      }
    }
  }, [isAuthenticated, user, navigate]);

  const [state, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      const result = await loginAction(prevState, formData);

      if (result.success && result.data?.token) {
        // Clear all cached queries before login to prevent showing previous user's data
        queryClient.clear();

        login(result.data.token, result.data.user);

        const role = result.data.user.role.toLowerCase();
        switch (role) {
          case 'admin':
          case 'moderator':
            navigate('/dashboard');
            break;
          case 'worker':
            navigate('/worker');
            break;
          case 'customer':
            navigate('/customer');
            break;
          default:
            navigate('/login');
        }
      }

      return result;
    },
    {
      success: false,
      message: '',
      data: null,
      errors: {},
    }
  );

  return (
    <div className='h-screen flex flex-col lg:flex-row items-center justify-center p-4 lg:p-6'>
      <div className='w-full lg:w-2/5 max-w-md text-center lg:text-left mb-8 lg:mb-0 lg:pr-12'>
        <div className='flex justify-center lg:justify-start mb-6'>
          <div className='flex justify-center lg:justify-start mb-3'>
            <img src={logo} alt='Logo' className='w-32 h-32 lg:w-48 lg:h-48' />
          </div>
        </div>

        <h1
          className='text-3xl lg:text-4xl font-extrabold mb-4'
          style={{
            background: `linear-gradient(135deg, ${colors.primary[900]} 0%, ${colors.accent[600]} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
          Quick Serve
        </h1>

        <p
          className='text-sm lg:text-base mb-2 leading-relaxed'
          style={{ color: colors.neutral[600] }}>
          Connect with trusted service providers in your area. Fast, reliable,
          and convenient.
        </p>
      </div>

      <div className='w-full lg:w-3/5 max-w-lg'>
        <div className='mb-6'>
          <h2
            className='text-2xl lg:text-3xl font-bold mb-2'
            style={{ color: colors.primary[900] }}>
            Welcome back
          </h2>

          <p className='text-xs' style={{ color: colors.neutral[500] }}>
            Don't have an account?{' '}
            <Link
              to='/signup'
              className='font-bold hover:underline transition-all'
              style={{ color: colors.accent[600] }}>
              Sign up
            </Link>
          </p>
        </div>

        <Card
          className='w-full'
          bgColor='bg-gradient-to-br from-blue-25 to-white'
          borderColor='border-blue-100'
          formCard={true}>
          {state.message && (
            <div
              className={`p-3 rounded-lg mb-4 text-sm ${
                state.success
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
              {state.message}
            </div>
          )}

          <form className='space-y-3' action={formAction}>
            <FormInput
              label='Email'
              name='email'
              type='email'
              placeholder='your@email.com'
              required
              error={state.errors?.email}
              icon={Mail}
            />

            <div>
              <FormInput
                label='Password'
                name='password'
                type='password'
                placeholder='Password'
                required
                error={state.errors?.password}
                icon={Lock}
              />
              <div className='text-right mt-2'>
                <Link
                  to='/forgot-password'
                  className='text-sm font-semibold text-blue-600 hover:text-blue-500 hover:underline transition-all'>
                  Forgot your password?
                </Link>
              </div>
            </div>

            <button
              type='submit'
              className='w-full py-2.5 px-4 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
              style={{
                background: `linear-gradient(135deg, ${colors.accent[500]} 0%, ${colors.accent[600]} 100%)`,
              }}
              disabled={isPending}>
              {isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
