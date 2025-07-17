// src/components/MemberInfo.tsx
import React from 'react';
import { Database } from '../integrations/supabase/types'; // Importa do arquivo Supabase types

type MemberRow = Database['public']['Tables']['members']['Row'];

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface MemberInfoProps {
    member: MemberRow | null;
    // Adiciona a mesma prop para a função que pega detalhes do plano
    getMemberPlanDetails: (member: MemberRow | null) => { name: string, price: number };
}

function MemberInfo({ member, getMemberPlanDetails }: MemberInfoProps) {
    if (!member) {
        return (
            <div className="text-center p-12 text-gray-400">
                <span role="img" aria-label="person icon" className="text-5xl block mb-4">👤</span>
                <p className="mt-4">Selecione um membro para ver as informações</p>
            </div>
        );
    }

    const planDetails = getMemberPlanDetails(member); // Obtém os detalhes do plano

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="memberName" className="text-gray-400">Nome:</Label>
                <Input id="memberName" value={member.full_name} readOnly className="bg-gray-700 border-gray-600 text-gray-100" />
            </div>
            <div>
                <Label htmlFor="memberPhone" className="text-gray-400">Telefone:</Label>
                <Input id="memberPhone" value={member.phone || 'Não informado'} readOnly className="bg-gray-700 border-gray-600 text-gray-100" />
                {!member.phone && (
                    <div className="bg-orange-500 text-white p-2 rounded-md mt-2 text-sm flex items-center">
                        <span role="img" aria-label="warning icon" className="mr-2">⚠️</span>
                        Obrigatório
                    </div>
                )}
            </div>
            <div>
                <Label htmlFor="memberPlan" className="text-gray-400">Plano:</Label>
                <Input id="memberPlan" value={`${planDetails.name} R$ ${planDetails.price.toFixed(2)}`} readOnly className="bg-gray-700 border-gray-600 text-gray-100" />
            </div>

            {!member.phone && (
                <div className="bg-red-500 text-white p-3 rounded-md mt-4 text-sm flex items-center">
                    <span role="img" aria-label="info icon" className="mr-2">ℹ️</span>
                    <div>
                        Informações obrigatórias em falta: Telefone
                        <p className="text-xs mt-1">Atualize o perfil do membro para gerar o link de pagamento.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MemberInfo;