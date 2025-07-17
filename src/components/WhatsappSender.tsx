// src/components/WhatsappSender.tsx
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"; // Shadcn Button
import { Input } from "@/components/ui/input"; // Shadcn Input
import { Label } from "@/components/ui/label"; // Shadcn Label
import { Textarea } from "@/components/ui/textarea"; // Shadcn Textarea
import { Database } from '../integrations/supabase/types'; // Importa tipo do Supabase

type MemberRow = Database['public']['Tables']['members']['Row'];

interface WhatsappSenderProps {
    member: MemberRow | null;
    generatedLink: string | null;
    getMemberPlanDetails: (member: MemberRow | null) => { name: string, price: number };
}

function WhatsappSender({ member, generatedLink, getMemberPlanDetails }: WhatsappSenderProps) {
    const [message, setMessage] = useState<string>('');

    // Efeito para gerar a mensagem padrão quando o membro ou link mudar
    useEffect(() => {
        if (member && generatedLink) {
            const planDetails = getMemberPlanDetails(member);
            const defaultMessage = `Olá ${member.full_name}!\n\nSua mensalidade da academia (${planDetails.name}) está disponível para pagamento:\n\n${generatedLink}`;
            setMessage(defaultMessage);
        } else {
            setMessage(''); // Limpa a mensagem se não houver membro ou link
        }
    }, [member, generatedLink, getMemberPlanDetails]);

    const handleSendWhatsapp = () => {
        if (!member || !member.phone) {
            alert('Não é possível enviar: Telefone do membro não informado.');
            return;
        }
        if (!generatedLink) {
            alert('Não é possível enviar: Link de pagamento não gerado.');
            return;
        }

        // Lógica mockada para envio (no futuro, chamaria uma API de WhatsApp)
        console.log(`Enviando mensagem para ${member.full_name} (${member.phone}):\n${message}`);
        alert('Mensagem simulada enviada com sucesso! (Verifique o console)');
        // No futuro: Chamar sua API de backend para enviar via WhatsApp
    };

    const isSendDisabled = !member || !member.phone || !generatedLink;

    return (
        <div className="space-y-4">
            {/* Informações do membro para envio */}
            <div>
                <Label htmlFor="whatsappMemberName" className="text-gray-400">Membro:</Label>
                <Input id="whatsappMemberName" value={member ? `${member.full_name} (${member.phone || 'Sem Telefone'})` : 'Nenhum membro selecionado'} readOnly className="bg-gray-700 border-gray-600 text-gray-100" />
            </div>

            {/* Pré-visualização da mensagem */}
            <div>
                <Label htmlFor="whatsappMessage" className="text-gray-400">Prévia da mensagem:</Label>
                <Textarea
                    id="whatsappMessage"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-gray-100 min-h-[120px]"
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
                <div className="bg-yellow-500 text-yellow-900 p-2 rounded-md text-sm flex items-center">
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