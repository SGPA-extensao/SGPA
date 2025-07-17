// src/components/SelectMember.tsx
import React from 'react';
import { Database } from '../integrations/supabase/types'; // Importa do arquivo Supabase types

type MemberRow = Database['public']['Tables']['members']['Row'];
type PlanRow = Database['public']['Tables']['plans']['Row'];

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SelectMemberProps {
    members: MemberRow[];
    onMemberSelect: (memberId: string) => void;
    selectedMemberId: string | null;
    // Adiciona uma prop para a função que pega detalhes do plano
    getMemberPlanDetails: (member: MemberRow | null) => { name: string, price: number };
}

function SelectMember({ members, onMemberSelect, selectedMemberId, getMemberPlanDetails }: SelectMemberProps) {
    return (
        <Select onValueChange={onMemberSelect} value={selectedMemberId || ''}>
            <SelectTrigger className="w-full bg-gray-700 text-gray-100 border-gray-600">
                <SelectValue placeholder="Selecione um membro..." />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 text-gray-100 border-gray-700">
                {members.map(member => {
                    const planDetails = getMemberPlanDetails(member);
                    return (
                        <SelectItem key={member.id} value={member.id}>
                            {member.full_name} ({member.phone ? member.phone : 'Sem telefone'}) - {planDetails.name}
                        </SelectItem>
                    );
                })}
            </SelectContent>
        </Select>
    );
}

export default SelectMember;