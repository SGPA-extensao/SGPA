import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Ensure this path is correct and exports `supabase` client
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Loader2, Save, Upload } from 'lucide-react';

import type { Member as BaseMember, Plan as BasePlan, Payment } from '@/lib/supabase';

interface Member extends BaseMember {
    last_payment_date?: string | null;
}

interface Plan extends BasePlan { }

const Pagamento = () => {
    const { toast } = useToast();
    const [members, setMembers] = useState<Member[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedMemberId, setSelectedMemberId] = useState<string>('');
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [paymentDate, setPaymentDate] = useState<Date>(new Date());
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsFetching(true);
            try {
                const [{ data: membersData, error: membersError }, { data: plansData, error: plansError }] = await Promise.all([
                    supabase.from('members').select('*').order('full_name'),
                    supabase.from('plans').select('*'),
                ]);

                if (membersError) throw membersError;
                if (plansError) throw plansError;

                if (membersData) setMembers(membersData);
                if (plansData) setPlans(plansData);
            } catch (error: any) { // Catch any type of error here
                console.error('Erro ao carregar dados:', error);
                toast({
                    title: "Erro",
                    description: `Não foi possível carregar os dados necessários: ${error.message || error.toString()}`,
                    variant: "destructive"
                });
            } finally {
                setIsFetching(false);
            }
        };

        fetchData();
    }, [toast]);

    useEffect(() => {
        if (selectedMemberId && members.length > 0) {
            const member = members.find(m => m.id === selectedMemberId);
            if (member && plans.length > 0) {
                setSelectedPlan(plans.find(p => p.id === member.plan_id) || null);
            }
        } else {
            setSelectedPlan(null);
        }
    }, [selectedMemberId, members, plans]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: "Erro",
                    description: "O arquivo deve ter no máximo 5MB",
                    variant: "destructive"
                });
                return;
            }
            if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
                toast({
                    title: "Erro",
                    description: "Apenas arquivos JPG, PNG ou PDF são permitidos",
                    variant: "destructive"
                });
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log('Iniciando validação do formulário...');

        // Validar comprovante primeiro
        if (!selectedFile) {
            toast({
                title: "Erro de Validação",
                description: "É obrigatório anexar um comprovante de pagamento.",
                variant: "destructive"
            });
            return;
        }

        // Validar outros campos
        if (!selectedMemberId || !selectedPlan) {
            toast({
                title: "Erro de Validação",
                description: "Por favor, selecione um membro e um plano.",
                variant: "destructive"
            });
            return;
        }

        if (!selectedPlan.price || !selectedPlan.duration_months) {
            const error = `Plano inválido - preço: ${selectedPlan.price}, duração: ${selectedPlan.duration_months}`;
            console.error(error);
            toast({
                title: "Erro de Validação",
                description: "O plano selecionado não possui preço ou duração válidos.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        try {
            console.log('Iniciando processo de pagamento...');

            // Upload do comprovante ao bucket do Supabase
            let receiptUrl = '';

            try {
                console.log('Tentando enviar comprovante...', selectedFile.name);
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `${selectedMemberId}_${Date.now()}.${fileExt}`;

                // Perform the upload
                const { error: uploadError } = await supabase.storage
                    .from('payment-receipts') // Use the correct bucket name as per your image
                    .upload(fileName, selectedFile, {
                        cacheControl: '3600',
                        upsert: true // Allows overwriting if a file with the same name exists
                    });

                if (uploadError) {
                    throw new Error(`Erro no upload: ${uploadError.message}`);
                }

                // Get the public URL of the uploaded file
                const { data: { publicUrl } } = supabase.storage
                    .from('payment-receipts') // Again, use the correct bucket name
                    .getPublicUrl(fileName);

                receiptUrl = publicUrl;
                console.log('Comprovante enviado com sucesso:', receiptUrl);

                toast({
                    title: "Sucesso",
                    description: "Comprovante enviado com sucesso",
                    variant: "default"
                });
            } catch (uploadError: any) { // Catch error of type any for robust handling
                console.error('Erro ao tentar upload:', uploadError);
                toast({
                    title: "Erro",
                    description: `Não foi possível salvar o comprovante. ${uploadError.message || ''} Por favor, tente novamente.`,
                    variant: "destructive"
                });
                return; // Stop execution if upload fails
            }

            // Calcular a próxima data de pagamento baseado na duração em meses
            const nextPaymentDate = new Date(paymentDate);
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + (selectedPlan.duration_months));
            console.log('Data do próximo pagamento:', nextPaymentDate.toISOString());

            // Criar o pagamento
            const paymentData = {
                member_id: selectedMemberId,
                amount: selectedPlan.price,
                payment_date: paymentDate.toISOString(),
                next_payment_date: nextPaymentDate.toISOString(),
                status: 'paid',
                receipt_url: receiptUrl, // Salvando a URL do comprovante
                created_at: new Date().toISOString()
            };
            console.log('Dados do pagamento a inserir:', paymentData);

            const { data: insertedPayment, error: paymentError } = await supabase
                .from('payments')
                .insert(paymentData)
                .select()
                .single();

            if (paymentError) {
                console.error('Erro ao inserir pagamento:', paymentError);
                throw new Error(`Erro ao inserir pagamento: ${paymentError.message}`);
            }

            console.log('Pagamento inserido com sucesso:', insertedPayment);

            // Atualizar a data do último pagamento do membro
            const { error: updateError } = await supabase
                .from('members')
                .update({ last_payment_date: paymentDate.toISOString() })
                .eq('id', selectedMemberId);

            if (updateError) {
                console.error('Erro ao atualizar data do último pagamento:', updateError);
                // Do not throw error here, as payment was already recorded successfully.
                // You might want to log this to a separate error tracking system.
            } else {
                console.log('Data do último pagamento atualizada com sucesso');
            }

            toast({
                title: "Sucesso!",
                description: "Pagamento registrado com sucesso.",
            });

            // Resetar formulário
            setSelectedMemberId('');
            setSelectedFile(null);
            setPaymentDate(new Date());
        } catch (error: any) { // Catch error of type any for robust handling
            console.error('Erro ao processar pagamento:', error);
            let errorMessage = 'Erro desconhecido';

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null && 'message' in error) {
                errorMessage = String(error.message);
            }

            console.error('Mensagem de erro formatada:', errorMessage);

            toast({
                title: "Erro no Pagamento",
                description: `Não foi possível processar o pagamento: ${errorMessage}`,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                    <p className="text-gray-600 dark:text-gray-300">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white text-center">
                Registro de Pagamento
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Selecionar Membro
                    </label>
                    <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione um membro" />
                        </SelectTrigger>
                        <SelectContent>
                            {members.map(membro => (
                                <SelectItem key={membro.id} value={membro.id}>
                                    {membro.full_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {selectedPlan && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Plano Atual
                        </h3>
                        <div className="text-gray-600 dark:text-gray-300 space-y-1">
                            <p>Nome: {selectedPlan.name}</p>
                            <p>Valor: R$ {selectedPlan.price.toFixed(2)}</p>
                            <p>Duração: {selectedPlan.duration_months} {selectedPlan.duration_months === 1 ? 'mês' : 'meses'}</p>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Data do Pagamento
                    </label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !paymentDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {paymentDate ? format(paymentDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={paymentDate}
                                onSelect={(date) => date && setPaymentDate(date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Comprovante de Pagamento <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg">
                        <div className="space-y-1 text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                <label
                                    htmlFor="file-upload"
                                    className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                >
                                    <span>Enviar arquivo</span>
                                    <input
                                        id="file-upload"
                                        name="file-upload"
                                        type="file"
                                        className="sr-only"
                                        onChange={handleFileChange}
                                        accept="image/jpeg,image/png,application/pdf"
                                    />
                                </label>
                                <p className="pl-1">ou arraste e solte</p>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                PNG, JPG ou PDF até 5MB
                            </p>
                            {selectedFile && (
                                <p className="text-sm text-green-600 dark:text-green-400">
                                    Arquivo selecionado: {selectedFile.name}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <Button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading || !selectedMemberId || !selectedFile}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processando...
                            </>
                        ) : !selectedFile ? (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Anexe o Comprovante
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Registrar Pagamento
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default Pagamento;