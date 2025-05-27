import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

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
        setError('Login ou senha incorreto. Tente novamente.');
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
    <div className="min-h-screen bg-black text-white">
      <div className="flex items-center justify-center min-h-screen px-4 pt-28 pb-10">
        <div className="grid md:grid-cols-2 w-full max-w-6xl items-center gap-10">
          {/* Texto do lado esquerdo */}
          <div className="space-y-6">
            <p className="text-sm text-gray-400">Apresentando nosso sistema de academia de última geração</p>
            <h1 className="text-4xl font-bold leading-tight">
              Evolua conosco... <br />
              <span className="text-white">Supere seus limites.</span>
            </h1>
            <p className="text-gray-300 max-w-md">
              Bem-vindo à academia Moviment de última geração, onde nos dedicamos a capacitar nossos membros para atingir seu potencial máximo.
            </p>
            <div className="flex space-x-4">
              <Button className="bg-white text-black px-6 hover:bg-gray-200">Começar</Button>
              <Link to="/signup" className="text-sm underline text-gray-400 hover:text-white self-center">Cadastrar-se agora</Link>
            </div>
          </div>

          {/* Card de login */}
          <div className="bg-white text-black rounded-xl shadow-md p-8 w-full max-w-md">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-black">Academia Moviment</h1>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm">
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700 block">Login</label>
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

              <div>
                <label htmlFor="password" className="text-sm font-medium text-gray-700 block">Senha</label>
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
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
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
                  <label htmlFor="remember" className="text-sm text-gray-700">Lembrar-me</label>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/reset-password-request')}
                  className="text-sm text-fitpro-purple hover:text-fitpro-darkPurple"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full bg-black text-white hover:bg-gray-900">
                {isLoading ? 'Entrando...' : 'Autenticar'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
