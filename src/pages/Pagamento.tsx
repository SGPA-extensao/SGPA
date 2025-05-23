import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Member {
  id: string;
  full_name: string;
  plan_id: number;
}

interface Plan {
  id: number;
  name: string;
  price: number;
}

const Pagamento = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'boleto' | 'pix' | ''>('');
  const [paymentCode, setPaymentCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      const { data: membersData, error: memError } = await supabase
        .from('members')
        .select('id, full_name, plan_id')
        .order('full_name');
      if (memError) {
        toast({ title: 'Erro', description: 'Erro ao carregar membros.', variant: 'destructive' });
        return;
      }
      setMembers(membersData || []);

      const { data: plansData, error: planError } = await supabase
        .from('plans')
        .select('*');
      if (planError) {
        toast({ title: 'Erro', description: 'Erro ao carregar planos.', variant: 'destructive' });
        return;
      }
      setPlans(plansData || []);
    }
    fetchData();
  }, [toast]);

  // Atualiza plano selecionado ao mudar o membro
  useEffect(() => {
    if (selectedMemberId) {
      const member = members.find(m => m.id === selectedMemberId);
      if (member) {
        const plan = plans.find(p => p.id === member.plan_id);
        setSelectedPlan(plan || null);
      } else {
        setSelectedPlan(null);
      }
      setPaymentMethod('');
      setPaymentCode('');
    }
  }, [selectedMemberId, members, plans]);

  // Gera um código fake para boleto ou pix
  const generatePaymentCode = () => {
    if (!selectedPlan || !paymentMethod) {
      toast({ title: 'Aviso', description: 'Selecione plano e método de pagamento.' });
      return;
    }
    if (paymentMethod === 'boleto') {
      // Simula um código de boleto (numérico, 47 dígitos)
      const code = Array.from({ length: 47 }, () => Math.floor(Math.random() * 10)).join('');
      setPaymentCode(code);
    } else if (paymentMethod === 'pix') {
      // Simula um código PIX (string alfanumérica)
      const code = `PIXQR-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
      setPaymentCode(code);
    }
  };

  // Salva o pagamento no banco
  const handleSavePayment = async () => {
    if (!selectedMemberId || !selectedPlan || !paymentMethod || !paymentCode) {
      toast({ title: 'Erro', description: 'Preencha todos os campos e gere o código.' });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('payments')
        .insert([{
          member_id: selectedMemberId,
          plan_id: selectedPlan.id,
          method: paymentMethod,
          code: paymentCode,
          amount: selectedPlan.price,
          status: 'pending',
          created_at: new Date().toISOString()
        }]);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Pagamento criado com sucesso!' });
      // Limpar campos
      setPaymentMethod('');
      setPaymentCode('');
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar pagamento.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gerar Pagamento</h1>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Membro</label>
        <select
          value={selectedMemberId}
          onChange={e => setSelectedMemberId(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full"
        >
          <option value="">Selecione um membro</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.full_name}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Plano</label>
        <Input value={selectedPlan ? `${selectedPlan.name} - R$ ${selectedPlan.price.toFixed(2)}` : ''} readOnly />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Método de Pagamento</label>
        <select
          value={paymentMethod}
          onChange={e => setPaymentMethod(e.target.value as 'boleto' | 'pix' | '')}
          className="border border-gray-300 rounded px-3 py-2 w-full"
          disabled={!selectedPlan}
        >
          <option value="">Selecione o método</option>
          <option value="boleto">Boleto</option>
          <option value="pix">Pix</option>
        </select>
      </div>

      <Button
        onClick={generatePaymentCode}
        disabled={!paymentMethod || !selectedPlan}
        className="mb-4"
      >
        Gerar Código
      </Button>

      {paymentCode && (
        <div className="mb-4">
          <label className="block mb-1 font-medium">Código Gerado</label>
          {paymentMethod === 'boleto' ? (
            <pre className="p-2 bg-gray-100 rounded">{paymentCode}</pre>
          ) : (
            <div className="p-4 bg-gray-100 rounded text-center font-mono">{paymentCode}</div>
          )}
        </div>
      )}

      <Button
        onClick={handleSavePayment}
        disabled={isLoading || !paymentCode}
      >
        Salvar Pagamento
      </Button>
    </div>
  );
};

export default Pagamento;
