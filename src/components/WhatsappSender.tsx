
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Database } from '../integrations/supabase/types';
import { useToast } from "@/components/ui/use-toast";

type MemberRow = Database['public']['Tables']['members']['Row'];

interface WhatsappSenderProps {
    member: MemberRow | null;
    generatedLink: string | null;
    getMemberPlanDetails: (member: MemberRow | null) => { name: string, price: number };
}

function WhatsappSender({ member, generatedLink, getMemberPlanDetails }: WhatsappSenderProps) {
    const [message, setMessage] = useState<string>('');
    const { toast } = useToast();

    useEffect(() => {
        if (member && generatedLink) {
            const planDetails = getMemberPlanDetails(member);
            const defaultMessage = `Olá ${member.full_name}!\n\nSua mensalidade da academia (${planDetails.name}) está disponível para pagamento:\n\n${generatedLink}`;
            setMessage(defaultMessage);
        } else {
            setMessage('');
        }
    }, [member, generatedLink, getMemberPlanDetails]);

    const handleSendWhatsapp = () => {
        if (!member || !member.phone) {
            toast({
                title: "Erro no Envio",
                description: "Não é possível enviar: Telefone do membro não informado.",
                variant: "destructive",
            });
            return;
        }
        if (!generatedLink) {
            toast({
                title: "Erro no Envio",
                description: "Não é possível enviar: Link de pagamento não gerado.",
                variant: "destructive",
            });
            return;
        }

        console.log(`Enviando mensagem para ${member.full_name} (${member.phone}):\n${message}`);
        toast({
            title: "Mensagem Enviada!",
            description: "A mensagem de WhatsApp foi simulada com sucesso! (Verifique o console para detalhes)",
        });
    };

    const isSendDisabled = !member || !member.phone || !generatedLink;

    return (
        <div className="space-y-4">
            {/* Informações do membro para envio */}
            <div>
                <Label htmlFor="whatsappMemberName" className="text-gray-600">Membro:</Label>
                {/* Campo INPUT: fundo branco/claro, texto escuro, borda clara */}
                <Input id="whatsappMemberName" value={member ? `${member.full_name} (${member.phone || 'Sem Telefone'})` : 'Nenhum membro selecionado'} readOnly className="bg-gray-100 border-gray-300 text-gray-800" />
            </div>

            {/* Pré-visualização da mensagem */}
            <div>
                <Label htmlFor="whatsappMessage" className="text-gray-600">Prévia da mensagem:</Label>
                {/* Campo TEXTAREA: fundo branco/claro, texto escuro, borda clara */}
                <Textarea
                    id="whatsappMessage"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-gray-100 border-gray-300 text-gray-800 min-h-[120px]"
                    placeholder="Aguardando link de pagamento..."
                />
            </div>

            {/* Botão de enviar e aviso */}
            <Button
                onClick={handleSendWhatsapp}
                disabled={isSendDisabled}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
                Enviar via API
            </Button>

            {isSendDisabled && (
                <div className="bg-yellow-200 text-yellow-800 p-2 rounded-md text-sm flex items-center">
                    <span role="img" aria-label="warning icon" className="mr-2">⚠️</span>
                    Não é possível enviar: {
                        !member ? 'Selecione um membro.' :
                        !member.phone ? 'Telefone do membro não definido.' :
                        'Link de pagamento não gerado.'
                    }
                </div>
            )}
        </div>
    );
}

export default WhatsappSender;