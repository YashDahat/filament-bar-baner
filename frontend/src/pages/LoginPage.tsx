import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    setLoginError(null);
    try {
      await login(data);
      // Redirection is handled by the useEffect above or ProtectedRoute
    } catch (error) {
      setLoginError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1A1A] text-[#F5F5F5]">
      <div className="bg-[#2A2A2A] p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Filament Bar Admin Login</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {loginError && <p className="text-red-500 text-center mb-4">{loginError}</p>}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#F5F5F5] mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full p-3 rounded bg-[#3A3A3A] border border-[#4A4A4A] focus:outline-none focus:border-[#FFB800] text-[#F5F5F5]"
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#F5F5F5] mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="w-full p-3 rounded bg-[#3A3A3A] border border-[#4A4A4A] focus:outline-none focus:border-[#FFB800] text-[#F5F5F5]"
              disabled={isSubmitting}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full p-3 rounded font-semibold bg-[#FFB800] text-[#1A1A1A] hover:bg-[#E0A200] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging In...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;