import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion'; // Import motion from framer-motion

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!fullName.trim()) newErrors.fullName = 'Informe seu nome completo';
    if (!email.trim()) newErrors.email = 'Informe seu email';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email inválido';
    if (password.length < 6) newErrors.password = 'A senha deve ter ao menos 6 caracteres.';
    if (password !== confirmPassword) newErrors.confirmPassword = 'As senhas não coincidem.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) throw error;

      toast({
        title: 'Cadastro realizado com sucesso!',
        description: 'Verifique seu email para confirmar o cadastro.',
        variant: 'default', // Using default for success
      });
      navigate('/login');
    } catch (error: any) {
      let userFriendlyMessage = 'Ocorreu um erro inesperado. Tente novamente mais tarde.';

      if (error.message.includes('duplicate key value violates unique constraint "users_email_key"')) {
        userFriendlyMessage = 'Este email já está cadastrado. Por favor, faça login ou use outro email.';
      } else if (error.message.includes('Password should be at least 6 characters')) { // Example for common Supabase error
        userFriendlyMessage = 'A senha deve ter ao menos 6 caracteres.';
      }
      // Add more specific error message mappings as needed

      toast({
        title: 'Erro ao cadastrar',
        description: userFriendlyMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClassName =
    'w-full bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-fitpro-purple focus:border-transparent transition-colors shadow-sm'; // Added shadow-sm

  const errorClassName = 'mt-1 text-xs text-red-600 font-semibold'; // Darker red for errors

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-black px-4 py-8"> {/* Gradient Background */}
      <motion.div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10 transform" // Increased shadow, rounded-2xl
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.1 }}
      >
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3 text-center select-none tracking-tight"> {/* tracking-tight for tighter spacing */}
          Academia Movimento
        </h1>
        <p className="text-gray-600 mb-8 text-center text-sm select-none">
          Crie sua conta no sistema <span className="font-semibold text-fitpro-purple">Movimento Gym</span>
        </p>

        <form onSubmit={handleSignup} noValidate>
          <div className="mb-6">
            <label htmlFor="fullName" className="block text-gray-700 font-medium mb-2 cursor-pointer">
              Nome Completo
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Seu nome completo" // Slightly changed placeholder
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setErrors((prev) => ({ ...prev, fullName: '' }));
              }}
              className={inputClassName + (errors.fullName ? ' border-red-500' : '')}
              autoComplete="name"
              disabled={isLoading}
            />
            {errors.fullName && <p className={errorClassName}>{errors.fullName}</p>}
          </div>

          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2 cursor-pointer">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="seu.email@exemplo.com" // Slightly changed placeholder
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: '' }));
              }}
              className={inputClassName + (errors.email ? ' border-red-500' : '')}
              autoComplete="email"
              disabled={isLoading}
            />
            {errors.email && <p className={errorClassName}>{errors.email}</p>}
          </div>

          <div className="mb-6 relative">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2 cursor-pointer">
              Senha
            </label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 6 caracteres" // Slightly changed placeholder
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: '' }));
              }}
              className={inputClassName + (errors.password ? ' border-red-500' : '') + ' pr-12'}
              autoComplete="new-password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1 -mr-2" // Added p-1 -mr-2 for better hit area and alignment
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              tabIndex={-1}
              disabled={isLoading}
            >
              {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
            {errors.password && <p className={errorClassName}>{errors.password}</p>}
          </div>

          <div className="mb-8 relative"> {/* Increased mb for final password input */}
            <label
              htmlFor="confirmPassword"
              className="block text-gray-700 font-medium mb-2 cursor-pointer"
            >
              Confirmar Senha
            </label>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirme sua senha"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }}
              className={inputClassName + (errors.confirmPassword ? ' border-red-500' : '') + ' pr-12'}
              autoComplete="new-password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1 -mr-2" // Added p-1 -mr-2
              aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
              tabIndex={-1}
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
            {errors.confirmPassword && <p className={errorClassName}>{errors.confirmPassword}</p>}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-fitpro-purple to-indigo-600 hover:from-fitpro-darkPurple hover:to-indigo-700 transition-all duration-300 font-semibold text-lg py-3 rounded-lg flex justify-center items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" // Gradient, larger shadow, slight lift
          >
            {isLoading && (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            )}
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>

          <p className="text-center mt-8 text-gray-600 text-sm select-none"> {/* Increased mt */}
            Já tem uma conta?{' '}
            <Link
              to="/login"
              className="text-fitpro-purple hover:text-fitpro-darkPurple font-medium transition-colors"
            >
              Faça login
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;