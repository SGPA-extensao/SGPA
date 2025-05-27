import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
    if (password.length < 6) newErrors.password = 'Senha deve ter ao menos 6 caracteres';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Senhas não coincidem';
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
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        title: 'Erro ao cadastrar',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClassName =
    'w-full bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-fitpro-purple focus:border-transparent transition-colors';

  const errorClassName = 'mt-1 text-xs text-red-500 font-semibold';

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3 text-center select-none">
          Academia Moviment
        </h1>
        <p className="text-gray-600 mb-8 text-center text-sm select-none">
          Crie sua conta no sistema FitPro Gym
        </p>

        <form onSubmit={handleSignup} noValidate>
          <div className="mb-6">
            <label htmlFor="fullName" className="block text-gray-700 font-medium mb-2 cursor-pointer">
              Nome Completo
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Digite seu nome completo"
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
              placeholder="Digite seu email"
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
              placeholder="Digite sua senha"
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
              className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              tabIndex={-1}
              disabled={isLoading}
            >
              {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
            {errors.password && <p className={errorClassName}>{errors.password}</p>}
          </div>

          <div className="mb-6 relative">
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
              className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
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
            className="w-full bg-fitpro-purple hover:bg-fitpro-darkPurple transition-colors duration-300 font-semibold text-lg py-3 rounded-md flex justify-center items-center gap-2"
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

          <p className="text-center mt-6 text-gray-600 text-sm select-none">
            Já tem uma conta?{' '}
            <Link
              to="/login"
              className="text-fitpro-purple hover:text-fitpro-darkPurple font-medium transition-colors"
            >
              Faça login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
