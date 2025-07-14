'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface ExercicioItem {
  dia: string;
  numero: string;
  exercicio: string;
  series: string;
  cg: string;
}

interface Member {
  id: string;
  full_name: string;
}

const grupos = {
  inferiores: [
    { dia: '22', numero: '01', exercicio: 'Abdução de Quadril' },
    { dia: '22', numero: '02', exercicio: 'Adutor de Quadril' },
    { dia: '06', numero: '03', exercicio: 'Afundo' },
    // ... outros exercícios
  ],
  superiores: [
    { dia: '22', numero: '01', exercicio: 'Des. Lombar' },
    { dia: '22', numero: '22', exercicio: 'Crucifixo Invertido' },
    { dia: '19', numero: '03', exercicio: 'Voador Dorsal' },
    // ...
  ],
  biceps: [
    { dia: '23', numero: '03', exercicio: 'Extensão de Punho' },
    { dia: '23', numero: '23', exercicio: 'Flexão de Punho' },
    { dia: '22', numero: '10', exercicio: 'Rosca Direta Alternada' },
    // ...
  ],
};

const FichaTreino = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [ficha, setFicha] = useState<Record<string, ExercicioItem[]>>(() => {
    const inicial: Record<string, ExercicioItem[]> = {};
    for (const grupo in grupos) {
      inicial[grupo] = grupos[grupo as keyof typeof grupos].map(item => ({
        ...item,
        series: '',
        cg: '',
      }));
    }
    return inicial;
  });

  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('members')
        .select('id, full_name')
        .order('full_name');

      if (error) {
        toast({ title: 'Erro', description: 'Falha ao carregar alunos.', variant: 'destructive' });
      } else {
        setMembers(data || []);
      }
    };

    fetchMembers();
  }, [toast]);

  const handleChange = (
    grupo: string,
    index: number,
    campo: keyof ExercicioItem,
    valor: string
  ) => {
    setFicha(prev => {
      const atualizado = [...prev[grupo]];
      atualizado[index] = { ...atualizado[index], [campo]: valor };
      return { ...prev, [grupo]: atualizado };
    });
  };

  const handleSubmit = async () => {
    if (!selectedMember) {
      toast({ title: 'Aluno não selecionado', description: 'Por favor, selecione o aluno.', variant: 'destructive' });
      return;
    }

    try {
      const payload = {
        member_id: selectedMember,
        created_at: new Date().toISOString(),
        ficha: ficha,
      };

      const { error } = await supabase.from('trainings').insert([payload]);

      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Ficha de treino salva para o aluno!' });
      setSelectedMember('');
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar no Supabase.', variant: 'destructive' });
    }
  };

  const renderTabela = (grupo: string, titulo: string) => (
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-2">{titulo}</h3>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Dia</th>
            <th className="border p-2">Nº</th>
            <th className="border p-2">Exercício</th>
            <th className="border p-2">Séries/R</th>
            <th className="border p-2">CG</th>
          </tr>
        </thead>
        <tbody>
          {ficha[grupo].map((item, index) => (
            <tr key={index}>
              <td className="border p-1">{item.dia}</td>
              <td className="border p-1">{item.numero}</td>
              <td className="border p-1">{item.exercicio}</td>
              <td className="border p-1">
                <input
                  type="text"
                  value={item.series}
                  onChange={(e) => handleChange(grupo, index, 'series', e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />
              </td>
              <td className="border p-1">
                <select
                  value={item.cg}
                  onChange={(e) => handleChange(grupo, index, 'cg', e.target.value)}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">Selecione</option>
                  <option value="Livre">Livre</option>
                  <option value="Carga Guiada">Carga Guiada</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Ficha de Treino - Por Aluno</h1>

      {/* Dropdown de Alunos */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold">Selecione o Aluno</label>
        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          className="w-full border rounded px-4 py-2"
        >
          <option value="">Selecione o aluno</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.full_name}
            </option>
          ))}
        </select>
      </div>

      {/* Tabelas */}
      {renderTabela('inferiores', 'Membros Inferiores')}
      {renderTabela('superiores', 'Membros Superiores / Costas')}
      {renderTabela('biceps', 'Bíceps / Antebraço')}

      <div className="flex justify-end mt-6">
        <Button onClick={handleSubmit}>Salvar Ficha</Button>
      </div>
    </div>
  );
};

export default FichaTreino;
