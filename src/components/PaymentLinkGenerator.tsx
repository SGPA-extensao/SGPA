
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Database } from '../integrations/supabase/types';
import { Link, QrCode } from 'lucide-react';

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
            <div className="text-right text-gray-900 text-2xl font-bold">
                R$ {memberPlanPrice.toFixed(2)}
            </div>

            {/* Opção de Link ou QR Code (com input type="radio" HTML básico) */}
            <div>
                <Label className="text-gray-600 mb-2 block">Tipo de Geração:</Label>
                <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                        <input
                            type="radio"
                            id="option-link"
                            name="generationType"
                            value="link"
                            checked={generationType === 'link'}
                            onChange={() => setGenerationType('link')}
                            className="form-radio text-blue-600 h-4 w-4 bg-white border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="option-link" className="flex items-center text-gray-800 cursor-pointer">
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
                            className="form-radio text-blue-600 h-4 w-4 bg-white border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="option-qr-code" className="flex items-center text-gray-800 cursor-pointer">
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
                <div className="bg-yellow-200 text-yellow-800 p-2 rounded-md text-sm flex items-center">
                    <span role="img" aria-label="warning icon" className="mr-2">⚠️</span>
                    Não é possível gerar o {generationType === 'link' ? 'link' : 'QR Code'}: {hasMissingPhone ? 'Telefone do membro não definido.' : 'Selecione um membro.'}
                </div>
            )}

            {/* Exibição do conteúdo gerado */}
            {generatedContent && (
                <div className="bg-green-200 text-green-800 p-3 rounded-md flex flex-col items-center justify-center text-center">
                    {generatedContent.type === 'link' ? (
                        <>
                            <Label className="font-semibold mb-2 text-green-800">Link Gerado com sucesso!</Label>
                            {/* Input para exibir o link gerado - FUNDO BRANCO/CLARO, TEXTO ESCURO, BORDA CLARA */}
                            <Input
                                type="text"
                                value={generatedContent.value}
                                readOnly
                                className="w-full text-sm font-medium underline bg-white border-gray-300 text-blue-600 cursor-pointer break-all"
                                onClick={() => navigator.clipboard.writeText(generatedContent.value)} // Adiciona copiar ao clicar no input
                            />
                            <Button variant="ghost" size="sm" className="mt-2 bg-green-300 hover:bg-green-400 text-green-900 border border-green-400">
                                📋 Copiar Link
                            </Button>
                        </>
                    ) : (
                        <>
                            <Label className="font-semibold mb-2 text-green-800">QR Code Gerado!</Label>
                            <div className="bg-white p-4 rounded-md w-32 h-32 flex items-center justify-center border border-gray-300">
                                <QrCode size={80} className="text-gray-800" />
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