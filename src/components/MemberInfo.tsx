
import React from 'react';
import { Database } from '../integrations/supabase/types';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type MemberRow = Database['public']['Tables']['members']['Row'];
type PlanRow = Database['public']['Tables']['plans']['Row'];

interface MemberInfoProps {
    member: MemberRow | null;
    getMemberPlanDetails: (member: MemberRow | null) => { name: string, price: number };
}

function MemberInfo({ member, getMemberPlanDetails }: MemberInfoProps) {
    if (!member) {
        return (
            <div className="text-center p-12 text-gray-500">
                <span role="img" aria-label="person icon" className="text-5xl block mb-4">👤</span>
                <p className="mt-4">Selecione um membro para ver as informações</p>
            </div>
        );
    }

    const planDetails = getMemberPlanDetails(member);

    return (
        <div className="space-y-4"> {/* Linha 28 no seu erro */}
            <div>
                <Label htmlFor="memberName" className="text-gray-600">Nome:</Label>
                <Input id="memberName" value={member.full_name} readOnly className="bg-gray-100 border-gray-300 text-gray-800" />
            </div>
            <div>
                <Label htmlFor="memberPhone" className="text-gray-600">Telefone:</Label>
                <Input id="memberPhone" value={member.phone || 'Não informado'} readOnly className="bg-gray-100 border-gray-300 text-gray-800" />
                {!member.phone && (
                    <div className="bg-orange-200 text-orange-800 p-2 rounded-md mt-2 text-sm flex items-center">
                        <span role="img" aria-label="warning icon" className="mr-2">⚠️</span>
                        Obrigatório
                    </div>
                )}
            </div>
            <div>
                <Label htmlFor="memberPlan" className="text-gray-600">Plano:</Label>
                <Input id="memberPlan" value={`${planDetails.name} R$ ${planDetails.price.toFixed(2)}`} readOnly className="bg-gray-100 border-gray-300 text-gray-800" />
            </div>

            {!member.phone && (
                <div className="bg-red-200 text-red-800 p-3 rounded-md mt-4 text-sm flex items-center">
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