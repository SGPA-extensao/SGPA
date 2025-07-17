
import React, { useState, useEffect } from 'react';
import { Database } from '../../integrations/supabase/types';
import { supabase } from '../../integrations/supabase/client';

type MemberRow = Database['public']['Tables']['members']['Row'];
type PlanRow = Database['public']['Tables']['plans']['Row'];
type GeneratedPaymentContent = { type: 'link' | 'qr_code', value: string } | null;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import SelectMember from '../../components/SelectMember';
import MemberInfo from '../../components/MemberInfo';
import PaymentLinkGenerator from '../../components/PaymentLinkGenerator';
import WhatsappSender from '../../components/WhatsappSender';

function PagamentoPage() {
    const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null);
    const [generatedPaymentContent, setGeneratedPaymentContent] = useState<GeneratedPaymentContent>(null);

    const [members, setMembers] = useState<MemberRow[]>([]);
    const [plans, setPlans] = useState<PlanRow[]>([]);
    const [loadingMembersAndPlans, setLoadingMembersAndPlans] = useState<boolean>(true);
    const [errorMembersAndPlans, setErrorMembersAndPlans] = useState<string | null>(null);

    useEffect(() => {
        const fetchMembersAndPlans = async () => {
            setLoadingMembersAndPlans(true);
            setErrorMembersAndPlans(null);
            try {
                const { data: membersData, error: membersError } = await supabase
                    .from('members')
                    .select('*')
                    .order('full_name', { ascending: true });

                if (membersError) throw membersError;
                setMembers(membersData || []);

                const { data: plansData, error: plansError } = await supabase
                    .from('plans')
                    .select('*');

                if (plansError) throw plansError;
                setPlans(plansData || []);

            } catch (err: any) {
                console.error("Erro ao carregar membros e planos do Supabase:", err);
                setErrorMembersAndPlans(err.message || "Erro ao carregar dados iniciais.");
            } finally {
                setLoadingMembersAndPlans(false);
            }
        };

        fetchMembersAndPlans();
    }, []);

    const handleMemberSelect = (memberId: string) => {
        const member = members.find(m => m.id === memberId);
        setSelectedMember(member || null);
        setGeneratedPaymentContent(null);
    };

    const getMemberPlanDetails = (member: MemberRow | null) => {
        if (!member) return { name: '', price: 0 };
        const plan = plans.find(p => p.id === member.plan_id);
        return { name: plan?.name || 'Plano Desconhecido', price: plan?.price || 0 };
    };

    const handleGeneratePaymentContent = (type: 'link' | 'qr_code') => {
        if (!selectedMember) return;

        let value: string;
        if (type === 'link') {
            value = `https://stripe.com/real_link_${selectedMember.id}_${Math.random().toString(36).substring(2, 10)}`;
        } else { // type === 'qr_code'
            value = `https://stripe.com/real_qr_${selectedMember.id}_${Math.random().toString(36).substring(2, 10)}`;
        }
        setGeneratedPaymentContent({ type, value });
    };


    if (loadingMembersAndPlans) {
        return (
            <div className="p-6 bg-gray-50 text-gray-700 min-h-screen flex justify-center items-center">
                <p>Carregando membros e planos...</p>
            </div>
        );
    }

    if (errorMembersAndPlans) {
        return (
            <div className="p-6 bg-gray-50 text-red-600 min-h-screen flex justify-center items-center">
                <p>Erro ao carregar dados iniciais: {errorMembersAndPlans}</p>
                <p>Verifique sua conexão com o Supabase e se há dados nas tabelas 'members' e 'plans'.</p>
            </div>
        );
    }


    return (
        <div className="p-6 bg-gray-50 text-gray-700 min-h-screen">
            {/* Header / Navegação - Botão Atualizar e Texto "Academia System" REMOVIDOS */}
            <div className="flex items-center mb-5">
                <button className="text-gray-700 text-2xl cursor-pointer mr-4">←</button>
                <h1 className="text-3xl font-bold text-gray-900">Pagamento via Stripe</h1>
                {/* Antigo div ml-auto com botão e texto removido daqui */}
            </div>

            <p className="mb-8 text-gray-600">Gere links de pagamento e envie via WhatsApp</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Bloco 1: Selecionar Membro */}
                <Card className="bg-white text-gray-700 border border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-800">1. Selecionar Membro</CardTitle>
                        <CardDescription className="text-gray-600">Escolha o membro que receberá o link de pagamento</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SelectMember
                            members={members}
                            onMemberSelect={handleMemberSelect}
                            selectedMemberId={selectedMember?.id || ''}
                            getMemberPlanDetails={getMemberPlanDetails}
                        />
                    </CardContent>
                </Card>

                {/* Bloco 3: Gerar Link/QR Code de Pagamento */}
                <Card className="bg-white text-gray-700 border border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-800">3. Gerar Link de Pagamento</CardTitle>
                        <CardDescription className="text-gray-600">Crie o link seguro do Stripe para o membro</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PaymentLinkGenerator
                            member={selectedMember}
                            memberPlanPrice={getMemberPlanDetails(selectedMember).price}
                            onGenerate={handleGeneratePaymentContent}
                            generatedContent={generatedPaymentContent}
                            hasMissingPhone={!selectedMember?.phone}
                        />
                    </CardContent>
                </Card>

                {/* Bloco 2: Informações do Membro */}
                <Card className="bg-white text-gray-700 border border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-800">2. Informações do Membro</CardTitle>
                        <CardDescription className="text-gray-600">Verifique os dados antes de gerar o link</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MemberInfo
                            member={selectedMember}
                            getMemberPlanDetails={getMemberPlanDetails}
                        />
                    </CardContent>
                </Card>

                {/* Bloco 4: Enviar via WhatsApp */}
                <Card className="bg-white text-gray-700 border border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-800">4. Enviar via WhatsApp</CardTitle>
                        <CardDescription className="text-gray-600">Envie o link automaticamente para o membro</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <WhatsappSender
                            member={selectedMember}
                            generatedLink={generatedPaymentContent?.type === 'link' ? generatedPaymentContent.value : null}
                            getMemberPlanDetails={getMemberPlanDetails}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default PagamentoPage;