import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, QrCode, Save, Loader2 } from 'lucide-react';

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

const PagamentoPix = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [pixCode, setPixCode] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: membersData }, { data: plansData }] = await Promise.all([
        supabase.from('members').select('id, full_name, plan_id').order('full_name'),
        supabase.from('plans').select('*'),
      ]);

      setMembers(membersData || []);
      setPlans(plansData || []);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const member = members.find(m => m.id === selectedMemberId);
    const plan = member ? plans.find(p => p.id === member.plan_id) : null;
    setSelectedPlan(plan || null);
    setPixCode('');
    setShowQR(false);
  }, [selectedMemberId, members, plans]);

  const generatePix = () => {
    if (!selectedPlan) {
      toast({ title: 'Aviso', description: 'Selecione um membro com plano.' });
      return;
    }

    const code = `PIX-${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
    setPixCode(code);
    setShowQR(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedMemberId || !selectedPlan || !pixCode) return;

    setIsLoading(true);
    try {
      const now = new Date();
      const nextDate = new Date();
      nextDate.setMonth(now.getMonth() + 1);

      const { error } = await supabase.from('payments').insert({
        member_id: selectedMemberId,
        amount: selectedPlan.price,
        status: 'paid',
        payment_date: now.toISOString(),
        next_payment_date: nextDate.toISOString(),
        created_at: now.toISOString(),
        method: 'pix',
        payment_code: pixCode,
      });

      if (error) throw error;

      toast({ title: 'Pagamento registrado com sucesso!' });
      setSelectedMemberId('');
      setPixCode('');
      setShowQR(false);
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar pagamento.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">💸 Pagamento por Pix</h1>

      <div className="bg-zinc-900 rounded-2xl p-6 space-y-6">
        <div>
          <label className="flex items-center gap-2 mb-2 text-sm font-medium">
            <User className="w-4 h-4" /> Membro
          </label>
          <select
            value={selectedMemberId}
            onChange={e => setSelectedMemberId(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2 w-full"
          >
            <option value="">Selecione um membro</option>
            {members.map(({ id, full_name }) => (
              <option key={id} value={id}>{full_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">Plano</label>
          <Input
            value={selectedPlan ? `${selectedPlan.name} - R$ ${selectedPlan.price.toFixed(2)}` : ''}
            readOnly
            className="bg-zinc-800 border border-zinc-700 text-white"
          />
        </div>

        <Button
          onClick={generatePix}
          disabled={!selectedPlan}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 justify-center"
        >
          <QrCode className="w-4 h-4" /> Gerar Pix
        </Button>

        {showQR && (
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-300">Escaneie o QR Code abaixo:</p>
            <div className="flex justify-center">
              <img src="/image.png" alt="QR Code Pix" className="w-52 h-52 rounded-lg border border-green-500" />            </div>
            <div className="bg-zinc-800 text-green-400 border border-green-500 rounded-lg px-4 py-3 font-mono break-words text-center">
              {pixCode}
            </div>
          </div>
        )}

        {showQR && (
          <Button
            onClick={handleConfirmPayment}
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 justify-center"
          >
            {isLoading ? <><Loader2 className="animate-spin w-4 h-4" /> Salvando...</> : <><Save className="w-4 h-4" /> Marcar como Pago</>}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PagamentoPix;
