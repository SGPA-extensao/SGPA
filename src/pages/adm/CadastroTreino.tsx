import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

interface Member {
  id: string;
  full_name: string;
}

const CadastroTreino = () => {
  const { toast } = useToast();

  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [level, setLevel] = useState<'iniciante' | 'intermediario' | 'avancado' | ''>('');
  const [responsible, setResponsible] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('id, full_name')
        .order('full_name');
      if (error) {
        toast({ title: 'Erro', description: 'Falha ao carregar membros.', variant: 'destructive' });
      } else {
        setMembers(data || []);
      }
      setLoading(false);
    };
    fetchMembers();
  }, [toast]);

  const toggleMember = (id: string) => {
    setSelectedMembers(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!name || !description || !duration || !level || !responsible) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor, preencha todos os campos.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedMembers.length === 0) {
      toast({
        title: 'Nenhum aluno selecionado',
        description: 'Selecione pelo menos um aluno para o treino.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    const durationNumber = Number(duration);
    if (isNaN(durationNumber) || durationNumber <= 0) {
      toast({
        title: 'Duração inválida',
        description: 'Informe um número válido para a duração.',
        variant: 'destructive',
      });
      setSaving(false);
      return;
    }

    try {
      const { error } = await supabase.from('trainings').insert([{
        name,
        description,
        duration: duration,
        level,
        responsible,
        members: selectedMembers,
        created_at: new Date().toISOString(),
      }]);

      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Treino cadastrado com sucesso!' });

      // Resetar formulário
      setName('');
      setDescription('');
      setDuration('');
      setLevel('');
      setResponsible('');
      setSelectedMembers([]);

    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar treino.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg flex flex-col gap-8">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 tracking-tight select-none">
        Cadastro de Treino
      </h1>

      <div className="space-y-4">
        <label className="block font-semibold text-gray-700">Nome do Treino</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={saving}
          aria-label="Nome do treino"
        />
      </div>

      <div className="space-y-4">
        <label className="block font-semibold text-gray-700">Descrição</label>
        <textarea
          className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={4}
          value={description}
          onChange={e => setDescription(e.target.value)}
          disabled={saving}
          aria-label="Descrição do treino"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-1">
          <label className="block font-semibold text-gray-700">Duração (minutos)</label>
          <input
            type="number"
            min={1}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            disabled={saving}
            aria-label="Duração do treino em minutos"
          />
        </div>

        <div className="space-y-1">
          <label className="block font-semibold text-gray-700">Nível</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={level}
            onChange={e => setLevel(e.target.value as 'iniciante' | 'intermediario' | 'avancado' | '')}
            disabled={saving}
            aria-label="Nível do treino"
          >
            <option value="">Selecione</option>
            <option value="iniciante">Iniciante</option>
            <option value="intermediario">Intermediário</option>
            <option value="avancado">Avançado</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block font-semibold text-gray-700">Responsável</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={responsible}
            onChange={e => setResponsible(e.target.value)}
            disabled={saving}
            aria-label="Nome do responsável"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-2">Selecionar Alunos</label>
        <div
          className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-4 grid grid-cols-2 gap-3"
          role="list"
          aria-label="Lista de alunos para seleção"
        >
          {loading ? (
            <p className="text-center col-span-2 text-indigo-600 font-semibold select-none">
              Carregando alunos...
            </p>
          ) : members.length === 0 ? (
            <p className="text-center col-span-2 text-gray-400 italic select-none">
              Nenhum aluno encontrado
            </p>
          ) : (
            members.map(member => (
              <label
                key={member.id}
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(member.id)}
                  onChange={() => toggleMember(member.id)}
                  disabled={saving}
                  aria-checked={selectedMembers.includes(member.id)}
                  aria-label={`Selecionar aluno ${member.full_name}`}
                />
                <span>{member.full_name}</span>
              </label>
            ))
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={saving || loading}
          className="px-10 py-3 text-xl font-semibold rounded-lg"
          aria-live="polite"
        >
          {saving ? 'Salvando...' : 'Salvar Treino'}
        </Button>
      </div>
    </div>
  );
};

export default CadastroTreino;
