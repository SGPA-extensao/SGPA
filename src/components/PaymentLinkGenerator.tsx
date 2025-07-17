// src/components/PaymentLinkGenerator.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button"; // Shadcn Button
import { Input } from "@/components/ui/input"; // Shadcn Input (ainda necessário para o link gerado)
import { Label } from "@/components/ui/label"; // Shadcn Label (ainda necessário para rótulos)
// Removidos: RadioGroup, RadioGroupItem - substituídos por HTML básico
import { Database } from '../integrations/supabase/types';
import { Link, QrCode } from 'lucide-react'; // Ícones (certifique-se que 'lucide-react' está instalado: npm install lucide-react)

type MemberRow = Database['public']['Tables']['members']['Row'];
type PaymentGenerationType = 'link' | 'qr_code';

interface PaymentLinkGeneratorProps {
    member: MemberRow | null;
    memberPlanPrice: number;
    onGenerate: (type: PaymentGenerationType) => void;
    generatedContent: { type: PaymentGenerationType, value: string } | null;
    hasMissingPhone: boolean;
}

function PaymentLinkGenerator({ member, memberPlanPrice, onGenerate, generatedContent, hasMissingPhone }: PaymentLinkGeneratorProps) {
    const [generationType, setGenerationType] = useState<PaymentGenerationType>('link');

    const handleGenerateClick = () => {
        onGenerate(generationType);
    };

    const isGenerateDisabled = !member || hasMissingPhone;

    return (
        <div className="space-y-6">
            {/* Exibição do valor do plano */}
            <div className="text-right text-gray-100 text-2xl font-bold">
                R$ {memberPlanPrice.toFixed(2)}
            </div>

            {/* Opção de Link ou QR Code (com input type="radio" HTML básico) */}
            <div>
                <Label className="text-gray-400 mb-2 block">Tipo de Geração:</Label>
                <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                        <input
                            type="radio"
                            id="option-link"
                            name="generationType"
                            value="link"
                            checked={generationType === 'link'}
                            onChange={() => setGenerationType('link')}
                            className="form-radio text-blue-600 h-4 w-4" // Tailwind classes para input radio
                            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--input-border)' }} // Fallback styles
                        />
                        <label htmlFor="option-link" className="flex items-center text-gray-100 cursor-pointer">
                            <Link className="mr-2" size={16} /> Link de Pagamento
                        </label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="radio"
                            id="option-qr-code"
                            name="generationType"
                            value="qr_code"
                            checked={generationType === 'qr_code'}
                            onChange={() => setGenerationType('qr_code')}
                            className="form-radio text-blue-600 h-4 w-4" // Tailwind classes
                            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--input-border)' }} // Fallback styles
                        />
                        <label htmlFor="option-qr-code" className="flex items-center text-gray-100 cursor-pointer">
                            <QrCode className="mr-2" size={16} /> QR Code
                        </label>
                    </div>
                </div>
            </div>


            {/* Botão de gerar */}
            <Button
                onClick={handleGenerateClick}
                disabled={isGenerateDisabled}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
                Gerar {generationType === 'link' ? 'Link de Pagamento' : 'QR Code'}
            </Button>

            {/* Mensagem de erro/aviso */}
            {isGenerateDisabled && (
                <div className="bg-yellow-500 text-yellow-900 p-2 rounded-md text-sm flex items-center">
                    <span role="img" aria-label="warning icon" className="mr-2">⚠️</span>
                    Não é possível gerar o {generationType === 'link' ? 'link' : 'QR Code'}: {hasMissingPhone ? 'Telefone do membro não definido.' : 'Selecione um membro.'}
                </div>
            )}

            {/* Exibição do conteúdo gerado */}
            {generatedContent && (
                <div className="bg-green-500 text-green-900 p-3 rounded-md flex flex-col items-center justify-center text-center">
                    {generatedContent.type === 'link' ? (
                        <>
                            <Label className="font-semibold mb-2 text-green-900">Link Gerado com sucesso!</Label>
                            <a href={generatedContent.value} target="_blank" rel="noopener noreferrer" className="text-sm font-medium underline truncate w-full break-all">
                                {generatedContent.value}
                            </a>
                            <Button variant="ghost" size="sm" className="mt-2 bg-green-600 hover:bg-green-700 text-white" onClick={() => navigator.clipboard.writeText(generatedContent.value)}>
                                📋 Copiar Link
                            </Button>
                        </>
                    ) : (
                        <>
                            <Label className="font-semibold mb-2 text-green-900">QR Code Gerado!</Label>
                            <div className="bg-white p-4 rounded-md w-32 h-32 flex items-center justify-center">
                                <QrCode size={80} className="text-gray-800" /> {/* Ícone placeholder */}
                            </div>
                            <span className="text-xs mt-2 text-gray-800">Escaneie para pagar</span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default PaymentLinkGenerator;