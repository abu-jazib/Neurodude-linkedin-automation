import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // ✅ For navigation
import { useAuth } from '../../context/AuthContext';
import Input from '../ui/Input';
import Button from '../ui/Button';
import logo from './logo.png';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginForm = () => {
  const { login, resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const navigate = useNavigate(); // ✅ Navigation hook

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setError('');
      await login(data.email, data.password);

      // ✅ Navigate to /create after successful login
      navigate('/create');
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      const email = getValues('email') || resetEmail;

      if (!email) {
        setError('Please enter your email address to reset your password');
        return;
      }

      setLoading(true);
      setError('');
      await resetPassword(email);
      setResetSent(true);
    } catch (err) {
      setError('Failed to send password reset email. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="w-full max-w-md px-6 py-8 bg-white/90 backdrop-blur-md shadow-xl rounded-2xl transition-all duration-300 hover:shadow-2xl">
      <div className="flex flex-col items-center mb-8">
        <div className="p-3 rounded-full bg-blue-100 text-blue-800 mb-3">
        <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome to NeuroDude</h1>
        <p className="text-gray-600 mt-1">Sign in to your account</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      {resetSent && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4 text-sm">
          Password reset link has been sent to your email address.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          leftIcon={<Mail size={18} />}
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
          onChange={(e) => setResetEmail(e.target.value)}
        />

        <Input
          label="Password"
          type="password"
          leftIcon={<Lock size={18} />}
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          })}
        />

        

        <Button type="submit" fullWidth isLoading={loading} className="mt-2">
          Sign in
        </Button>
      </form>


    </div>
    
  );
};

export default LoginForm;
