import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  fetchMembers,
  fetchAttendanceByDate,
  registerAttendance,
  deleteAttendance,
} from '@/lib/supabase';

interface Member {
  id: string;
  full_name: string;
}

interface Attendance {
  member_id: string;
}

// Spinner simples para loading
const Spinner = () => (
  <svg
    className="animate-spin h-6 w-6 text-indigo-600"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

const Frequencia = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [presence, setPresence] = useState<Record<string, boolean>>({});
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Carrega membros e presença inicial
    const loadData = async () => {
      setLoading(true);
      try {
        const membersData = await fetchMembers();
        setMembers(membersData);
        const attendanceData = await fetchAttendanceByDate(date);
        const presenceMap: Record<string, boolean> = {};
        attendanceData.forEach(a => {
          presenceMap[a.member_id] = true;
        });
        setPresence(presenceMap);
      } catch {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados. Tente novamente.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    // Atualiza presença quando a data muda
    const loadPresenceByDate = async () => {
      setLoading(true);
      try {
        const attendanceData = await fetchAttendanceByDate(date);
        const presenceMap: Record<string, boolean> = {};
        attendanceData.forEach(a => {
          presenceMap[a.member_id] = true;
        });
        setPresence(presenceMap);
      } catch {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as presenças da data selecionada.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    loadPresenceByDate();
  }, [date]);

  const togglePresence = (memberId: string) => {
    setPresence(prev => ({ ...prev, [memberId]: !prev[memberId] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Busca IDs marcados
      const selectedIds = Object.entries(presence)
        .filter(([, checked]) => checked)
        .map(([id]) => id);

      const attendanceData = await fetchAttendanceByDate(date);
      const currentlyRegistered = attendanceData.map(a => a.member_id);

      // Diferença para criar e deletar
      const toCreate = selectedIds.filter(id => !currentlyRegistered.includes(id));
      const toDelete = currentlyRegistered.filter(id => !selectedIds.includes(id));

      await Promise.all([
        ...toCreate.map(id => registerAttendance(id, date)),
        ...toDelete.map(id => deleteAttendance(id, date)),
      ]);

      toast({
        title: 'Sucesso',
        description: 'Presenças atualizadas com sucesso!',
      });
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar presenças. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg flex flex-col gap-8">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 tracking-tight select-none">
        Frequência
      </h1>

      <div className="flex justify-center">
        <label htmlFor="date" className="sr-only">
          Selecionar data
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          disabled={loading || saving}
          className="border border-gray-300 rounded-lg px-5 py-3 text-lg
            focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:border-indigo-600
            transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Selecionar data para frequência"
        />
      </div>

      <div className="overflow-x-auto">
        <table
          className="w-full table-auto border-collapse rounded-lg overflow-hidden
          shadow-md border border-gray-200"
          role="table"
          aria-label="Tabela de membros para frequência"
        >
          <thead className="bg-indigo-50">
            <tr>
              <th
                scope="col"
                className="text-left px-6 py-4 font-semibold text-indigo-900 select-none"
              >
                Nome
              </th>
              <th
                scope="col"
                className="text-center px-6 py-4 font-semibold text-indigo-900 select-none"
              >
                Presente
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="py-16 text-center text-indigo-600 flex justify-center">
                  <Spinner />
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="py-16 text-center text-gray-400 italic select-none"
                >
                  Nenhum membro encontrado
                </td>
              </tr>
            ) : (
              members.map((member, i) => (
                <tr
                  key={member.id}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-indigo-50'}
                >
                  <td className="px-6 py-4 text-gray-800 font-medium select-text">
                    {member.full_name}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      id={`presence-${member.id}`}
                      checked={!!presence[member.id]}
                      onChange={() => togglePresence(member.id)}
                      disabled={loading || saving}
                      className="w-6 h-6 rounded border-gray-300 text-indigo-600
                        focus:ring-indigo-500 cursor-pointer transition"
                      aria-label={`Marcar presença de ${member.full_name}`}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleSave}
          disabled={loading || saving}
          className="px-8 py-4 text-xl font-semibold rounded-lg
            bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
            transition-shadow shadow-indigo-400/50"
          aria-live="polite"
        >
          {(saving && 'Salvando...') || 'Salvar Presença'}
        </Button>
      </div>
    </div>
  );
};

export default Frequencia;
