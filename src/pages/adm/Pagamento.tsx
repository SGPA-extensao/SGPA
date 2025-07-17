// src/pages/adm/Pagamento.tsx
import React, { useState } from 'react';
// Importa o tipo 'Database' do seu arquivo Supabase types
import { Database } from '../../integrations/supabase/types'; // Caminho ajustado

// Define um tipo mais fácil de usar para o membro e plano, baseado no Supabase
type MemberRow = Database['public']['Tables']['members']['Row'];
type PlanRow = Database['public']['Tables']['plans']['Row'];

// Importações dos componentes Shadcn/UI
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Importações dos seus novos componentes (caminhos relativos a Pagamento.tsx)
import SelectMember from '../../components/SelectMember';
import MemberInfo from '../../components/MemberInfo';
import PaymentLinkGenerator from '../../components/PaymentLinkGenerator';
import WhatsappSender from '../../components/WhatsappSender';
// import OperationSummary from '../../components/OperationSummary'; // REMOVIDO: Nao sera mais usado


// Dados mockados para simular a lista de membros
const MOCKED_MEMBERS: MemberRow[] = [
    {
        id: 'm1', full_name: "João Silva Santos", phone: "(65) 99999-1234",
        plan_id: 1,
        cpf_id: '111.111.111-11', created_at: new Date().toISOString(), entry_date: new Date().toISOString().split('T')[0], notes: null, status: true, user_id: 'user1'
    },
    {
        id: 'm2', full_name: "Maria Oliveira Costa", phone: "(65) 98888-5678",
        plan_id: 2,
        cpf_id: '222.222.222-22', created_at: new Date().toISOString(), entry_date: new Date().toISOString().split('T')[0], notes: null, status: true, user_id: 'user2'
    },
    {
        id: 'm3', full_name: "Pedro Santos Lima", phone: null, // Telefone nulo para testar o aviso
        plan_id: 3,
        cpf_id: '333.333.333-33', created_at: new Date().toISOString(), entry_date: new Date().toISOString().split('T')[0], notes: null, status: true, user_id: 'user3'
    },
    {
        id: 'm4', full_name: "Ana Carolina Ferreira", phone: "(65) 97777-9999",
        plan_id: 4,
        cpf_id: '444.444.444-44', created_at: new Date().toISOString(), entry_date: new Date().toISOString().split('T')[0], notes: null, status: true, user_id: 'user4'
    },
];

// Mock de planos para associar plan_id com nome e preço do plano
const MOCKED_PLANS: PlanRow[] = [
    { id: 1, name: "Plano Básico", price: 89.90, description: "Plano mensal básico", duration_months: 1 },
    { id: 2, name: "Plano Premium", price: 149.90, description: "Plano mensal premium", duration_months: 1 },
    { id: 3, name: "Plano VIP", price: 199.90, description: "Plano mensal VIP", duration_months: 1 },
    { id: 4, name: "Plano Diário", price: 30.00, description: "Acesso por um dia", duration_months: 0 },
];


function PagamentoPage() {
    // Estado para armazenar o membro selecionado
    const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null);
    // Estado: Para armazenar o link de pagamento gerado (ou QR Code)
    type GeneratedPaymentContent = { type: 'link' | 'qr_code', value: string } | null;
    const [generatedPaymentContent, setGeneratedPaymentContent] = useState<GeneratedPaymentContent>(null);


    // Função que será chamada pelo componente SelectMember quando um membro for escolhido
    const handleMemberSelect = (memberId: string) => {
        const member = MOCKED_MEMBERS.find(m => m.id === memberId);
        setSelectedMember(member || null);
        setGeneratedPaymentContent(null); // Reseta o conteúdo gerado ao trocar de membro
    };

    // Função auxiliar para obter o nome e preço do plano de um membro
    // Essa função será passada para os componentes filhos
    const getMemberPlanDetails = (member: MemberRow | null) => {
        if (!member) return { name: '', price: 0 };
        const plan = MOCKED_PLANS.find(p => p.id === member.plan_id);
        return { name: plan?.name || 'Plano Desconhecido', price: plan?.price || 0 };
    };

    // Função para simular a geração do link de pagamento ou QR Code
    const handleGeneratePaymentContent = (type: 'link' | 'qr_code') => {
        if (!selectedMember) return;

        let value: string;
        if (type === 'link') {
            value = `https://stripe.com/test_link_${Math.random().toString(36).substring(2, 10)}`;
        } else { // type === 'qr_code'
            value = `https://stripe.com/test_qr_${Math.random().toString(36).substring(2, 10)}`;
        }
        setGeneratedPaymentContent({ type, value });
    };


    return (
        // Classes Tailwind CSS para estilização (background, padding, cores de texto)
        <div className="p-6 bg-gray-900 text-gray-300 min-h-screen">
            {/* Header / Navegação */}
            <div className="flex items-center mb-5">
                {/* Ícone de voltar (pode ser um componente de ícone do seu sistema) */}
                <button className="text-gray-300 text-2xl cursor-pointer mr-4">←</button>
                <h1 className="text-3xl font-bold text-gray-100">Pagamento via Stripe</h1>
                <div className="ml-auto flex items-center">
                    <Button variant="outline" className="mr-4">Atualizar</Button>
                    <span className="text-lg text-gray-300"> Academia System</span>
                </div>
            </div>

            <p className="mb-8 text-gray-400">Gere links de pagamento e envie via WhatsApp</p>

            {/* Grid para organizar os 4 blocos principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Bloco 1: Selecionar Membro */}
                <Card className="bg-gray-800 text-gray-300">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-100">1. Selecionar Membro</CardTitle>
                        <CardDescription className="text-gray-400">Escolha o membro que receberá o link de pagamento</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SelectMember
                            members={MOCKED_MEMBERS}
                            onMemberSelect={handleMemberSelect}
                            selectedMemberId={selectedMember?.id || ''}
                            getMemberPlanDetails={getMemberPlanDetails}
                        />
                    </CardContent>
                </Card>

                {/* Bloco 3: Gerar Link/QR Code de Pagamento */}
                <Card className="bg-gray-800 text-gray-300">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-100">3. Gerar Link de Pagamento</CardTitle>
                        <CardDescription className="text-gray-400">Crie o link seguro do Stripe para o membro</CardDescription>
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
                <Card className="bg-gray-800 text-gray-300">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-100">2. Informações do Membro</CardTitle>
                        <CardDescription className="text-gray-400">Verifique os dados antes de gerar o link</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MemberInfo member={selectedMember} getMemberPlanDetails={getMemberPlanDetails} />
                    </CardContent>
                </Card>

                {/* Bloco 4: Enviar via WhatsApp */}
                <Card className="bg-gray-800 text-gray-300">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-100">4. Enviar via WhatsApp</CardTitle>
                        <CardDescription className="text-gray-400">Envie o link automaticamente para o membro</CardDescription>
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
            {/* O bloco "Resumo da Operação" foi completamente removido daqui */}
        </div>
    );
}

export default PagamentoPage;