
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const ResetPasswordRequest = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error) {
      console.error('Error requesting password reset:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o email de redefinição. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-fitpro-lightGray p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 card-shadow">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-fitpro-darkPurple">Esqueceu sua senha?</h1>
          <p className="text-fitpro-gray mt-2">
            Digite seu email e enviaremos instruções para redefinir sua senha
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 text-green-600 p-4 rounded-md mb-6">
              <p>
                Um link de redefinição de senha foi enviado para {email}. 
                Verifique sua caixa de entrada.
              </p>
            </div>
            <Button 
              onClick={() => navigate('/login')} 
              className="w-full bg-fitpro-purple hover:bg-fitpro-darkPurple"
            >
              Voltar para o login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleRequestReset} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu email cadastrado"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-fitpro-purple hover:bg-fitpro-darkPurple"
            >
              {isLoading ? 'Enviando...' : 'Enviar instruções'}
            </Button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-fitpro-purple hover:text-fitpro-darkPurple"
              >
                Voltar para o login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordRequest;
