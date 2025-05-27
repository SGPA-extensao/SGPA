import React, { useState, useEffect, useRef } from 'react';
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
  const [filter, setFilter] = useState(''); // para filtro de membros
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const prevDateRef = useRef(date);

  // Carregar membros e presenças
  useEffect(() => {
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
        setHasUnsavedChanges(false);
        prevDateRef.current = date;
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
  }, [date, toast]);

  // Ao mudar a data, se houver mudanças não salvas, confirmar antes
  const handleDateChange = (newDate: string) => {
    if (hasUnsavedChanges) {
      const confirmChange = window.confirm(
        'Você tem alterações não salvas. Deseja descartar e mudar a data?'
      );
      if (!confirmChange) return;
    }
    setDate(newDate);
    setHasUnsavedChanges(false);
  };

  // Toggle presença e sinalizar que há mudanças não salvas
  const togglePresence = (memberId: string) => {
    setPresence(prev => {
      const newPresence = { ...prev, [memberId]: !prev[memberId] };
      setHasUnsavedChanges(true);
      return newPresence;
    });
  };

  // Filtrar membros pelo nome
  const filteredMembers = members.filter(m =>
    m.full_name.toLowerCase().includes(filter.toLowerCase())
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const selectedIds = Object.entries(presence)
        .filter(([, checked]) => checked)
        .map(([id]) => id);

      const attendanceData = await fetchAttendanceByDate(date);
      const currentlyRegistered = attendanceData.map(a => a.member_id);

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
      setHasUnsavedChanges(false);
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

  // Contar quantos estão marcados presentes
  const presentCount = Object.values(presence).filter(Boolean).length;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg flex flex-col gap-6">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 tracking-tight select-none">
        Frequência
      </h1>

      <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <label htmlFor="date" className="sr-only">
            Selecionar data
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={e => handleDateChange(e.target.value)}
            disabled={loading || saving}
            className="border border-gray-300 rounded-lg px-5 py-3 text-lg
            focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:border-indigo-600
            transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Selecionar data para frequência"
          />
          <span className="text-gray-600 ml-2 select-none" aria-live="polite">
            {presentCount} presente{presentCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Filtro para busca */}
        <input
          type="text"
          placeholder="Buscar membro..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          disabled={loading || saving}
          className="border border-gray-300 rounded-lg px-4 py-2 text-lg
            focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:border-indigo-600
            transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Buscar membros pelo nome"
        />
      </div>

      <div className="overflow-x-auto max-h-[480px] rounded-md border border-gray-200 shadow-md">
        <table
          className="w-full table-auto border-collapse"
          role="table"
          aria-label="Tabela de membros para frequência"
        >
          <thead className="bg-indigo-50 sticky top-0 z-10">
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
            ) : filteredMembers.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="py-16 text-center text-gray-400 italic select-none"
                >
                  Nenhum membro encontrado
                </td>
              </tr>
            ) : (
              filteredMembers.map((member, i) => (
                <tr key={member.id} className={i % 2 === 0 ? 'bg-white' : 'bg-indigo-50'}>
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
                      tabIndex={0}
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
          disabled={loading || saving || !hasUnsavedChanges}
          className="px-8 py-4 text-xl font-semibold rounded-lg
            bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
            transition-shadow shadow-indigo-400/50 flex items-center justify-center gap-2"
          aria-live="polite"
        >
          {saving && <Spinner />}
          {saving ? 'Salvando...' : 'Salvar Presença'}
        </Button>
      </div>
    </div>
  );
};

export default Frequencia;
