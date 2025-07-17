
import React from 'react';
import { Database } from '../integrations/supabase/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type MemberRow = Database['public']['Tables']['members']['Row'];
type PlanRow = Database['public']['Tables']['plans']['Row'];

interface SelectMemberProps {
    members: MemberRow[];
    onMemberSelect: (memberId: string) => void;
    selectedMemberId: string | null;
    getMemberPlanDetails: (member: MemberRow | null) => { name: string, price: number };
}

function SelectMember({ members, onMemberSelect, selectedMemberId, getMemberPlanDetails }: SelectMemberProps) {
    return (
        <Select onValueChange={onMemberSelect} value={selectedMemberId || ''}>
            {/* Campo SELECT: fundo branco/claro, texto escuro, borda clara */}
            <SelectTrigger className="w-full bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder="Selecione um membro..." />
            </SelectTrigger>
            {/* Conteúdo do SELECT (opções): fundo branco/claro, texto escuro, borda clara */}
            <SelectContent className="bg-white text-gray-800 border-gray-300 shadow-lg">
                {members.map(member => {
                    const planDetails = getMemberPlanDetails(member);
                    return (
                        <SelectItem key={member.id} value={member.id} className="hover:bg-gray-100">
                            {member.full_name} ({member.phone ? member.phone : 'Sem telefone'}) - {planDetails.name}
                        </SelectItem>
                    );
                })}
            </SelectContent>
        </Select>
    );
}

export default SelectMember;