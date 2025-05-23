import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await login(email, password);

      if (error) {
        setError('Email ou senha incorretos. Tente novamente.');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Ocorreu um erro ao fazer login. Tente novamente.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-start bg-black"
      style={{ paddingLeft: '-3cm', paddingRight: '3cm' }}
    >
      {/* Linha roxa vertical na posição original */}
      <div
        className="absolute w-1"
        style={{ left: '1cm', top: '58px', bottom: 0, backgroundColor: '#4C1D95' }}
      />

      {/* Conteúdo à direita da linha */}
      <div
        className="flex items-center"
        style={{ marginLeft: 'calc(1cm)', gap: '1rem' }}
      >
       <div
  style={{
    color: 'white',
    fontSize: '2.5rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    marginLeft: '3cm', 
    marginRight: '3cm',  // distância da linha em 1cm
  }}
>
  Bem-vindo ao FitPro Gym
</div>

        {/* Card branco */}
        <div style={{ width: '14cm' }} className="bg-white rounded-xl shadow-md p-8 card-shadow">
          <div className="flex justify-center mb-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-fitpro-darkPurple">Academia Moviment</h1>
              <p className="text-fitpro-gray mt-2">Sistema de gestão FitPro Gym</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
                Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Lembrar-me
                </label>
              </div>

              <button
                type="button"
                onClick={() => navigate('/reset-password-request')}
                className="text-sm text-fitpro-purple hover:text-fitpro-darkPurple"
              >
                Esqueceu sua senha?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-fitpro-purple hover:bg-fitpro-darkPurple"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Link to="/signup" className="text-fitpro-purple hover:text-fitpro-darkPurple">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
