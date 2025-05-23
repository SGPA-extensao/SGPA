import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

interface Member {
  id: string;
  full_name: string;
}

interface Presence {
  member_id: string;
  date: string;
  present: boolean;
}

const Frequencia = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [presence, setPresence] = useState<Record<string, boolean>>({});
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('id, full_name')
        .order('full_name', { ascending: true });
      if (error) {
        toast({ title: 'Erro', description: 'Erro ao carregar membros.', variant: 'destructive' });
      } else if (data) {
        setMembers(data);
        // Opcional: carregar presença da data selecionada para preencher checkbox
        await fetchPresence(data);
      }
      setIsLoading(false);
    };

    const fetchPresence = async (membersData: Member[]) => {
      const { data, error } = await supabase
        .from('presence')
        .select('member_id, present')
        .eq('date', date);
      if (!error && data) {
        const presenceMap: Record<string, boolean> = {};
        data.forEach((p: any) => {
          presenceMap[p.member_id] = p.present;
        });
        setPresence(presenceMap);
      }
    };

    fetchMembers();
  }, [date, toast]);

  const togglePresence = (memberId: string) => {
    setPresence(prev => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Monta array para inserção ou update
      const presenceArray = members.map(member => ({
        member_id: member.id,
        date,
        present: presence[member.id] || false,
      }));

      // Você pode usar upsert para inserir ou atualizar registros
      const { error } = await supabase
        .from('presence')
        .upsert(presenceArray, { onConflict: ['member_id', 'date'] });
      
      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Presenças salvas com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar presença.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Frequência</h1>

      <div className="mb-4">
        <label htmlFor="date" className="block font-medium mb-1">Data:</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full"
          disabled={isLoading}
        />
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">Nome</th>
            <th className="border border-gray-300 px-4 py-2 text-center">Presente</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={2} className="text-center py-8">
                Carregando...
              </td>
            </tr>
          ) : members.length === 0 ? (
            <tr>
              <td colSpan={2} className="text-center py-8 text-gray-500">
                Nenhum membro encontrado
              </td>
            </tr>
          ) : (
            members.map(member => (
              <tr key={member.id}>
                <td className="border border-gray-300 px-4 py-2">{member.full_name}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={presence[member.id] || false}
                    onChange={() => togglePresence(member.id)}
                    disabled={isLoading}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Button
        onClick={handleSave}
        className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        disabled={isLoading}
      >
        Salvar Presença
      </Button>
    </div>
  );
};

export default Frequencia;
