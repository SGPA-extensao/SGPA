import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const Configuracoes = () => {
    const { toast } = useToast();

    const [academyName, setAcademyName] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('settings' as any)
                .select('*')
                .single();

            if (error) {
                console.error('Erro ao buscar configurações:', error);
            } else if (data) {
                const typedData = data as any;
                setAcademyName(typedData.academy_name || '');
                setWhatsappNumber(typedData.whatsapp_number || '');
            }
            setIsLoading(false);
        };

        fetchSettings();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const { error } = await supabase
            .from('settings' as any)
            .upsert({
                id: 1,
                academy_name: academyName,
                whatsapp_number: whatsappNumber,
            });

        setIsLoading(false);

        if (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível salvar as configurações.',
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'Sucesso',
                description: 'Configurações salvas com sucesso.',
            });
        }
    };

    const handleBack = () => {
        window.history.back();
    };

    return (
        <div className="max-w-lg mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Configurações da Academia</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Nome da Academia</label>
                    <Input
                        value={academyName}
                        onChange={(e) => setAcademyName(e.target.value)}
                        placeholder="Ex: FitPro Academia"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">WhatsApp</label>
                    <Input
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="Ex: (11) 91234-5678"
                    />
                </div>

                <div className="flex space-x-2">
                    <Button type="button" variant="secondary" onClick={handleBack}>
                        Voltar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Salvando...' : 'Salvar Configurações'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default Configuracoes;
