import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Member, Plan } from '@/lib/supabase';
import {
  PlusCircle, Search, MoreHorizontal, Edit, Eye, UserX, UserCheck, ArrowUpDown
} from 'lucide-react';

// Hook customizado para buscar membros e planos
function useMembersAndPlans() {
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .order('full_name', { ascending: true });
      if (membersError) throw membersError;

      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('*');
      if (plansError) throw plansError;

      setMembers(membersData ?? []);
      setPlans(plansData ?? []);
    } catch (error) {
      console.error('Erro ao carregar membros ou planos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os membros ou planos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { members, plans, isLoading, setMembers };
}

const Members = () => {
  const { members, plans, isLoading, setMembers } = useMembersAndPlans();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [loadingToggleId, setLoadingToggleId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Normaliza CPF para só números
  const normalizeCPF = (cpf: string) => cpf.replace(/\D/g, '');

  // Map de plano por id para acesso rápido
  const planNamesById = useMemo(() => {
    const map = new Map<number, string>();
    plans.forEach(plan => map.set(plan.id, plan.name));
    return map;
  }, [plans]);

  // Toggle ordenação
  const toggleSort = () => setSortAsc(prev => !prev);

  // Filtra membros por nome ou CPF normalizado
  const filteredMembers = useMemo(() => {
    const termLower = searchTerm.toLowerCase();
    const normTerm = normalizeCPF(searchTerm);
    return members.filter(member =>
      member.full_name.toLowerCase().includes(termLower) ||
      normalizeCPF(member.cpf_id).includes(normTerm)
    );
  }, [members, searchTerm]);

  // Ordena membros filtrados
  const sortedMembers = useMemo(() => {
    return [...filteredMembers].sort((a, b) =>
      sortAsc
        ? a.full_name.localeCompare(b.full_name)
        : b.full_name.localeCompare(a.full_name)
    );
  }, [filteredMembers, sortAsc]);

  // Toggle status com loading no botão e atualização local
  const handleToggleStatus = async (member: Member) => {
    setLoadingToggleId(member.id);
    try {
      const { error } = await supabase
        .from('members')
        .update({ status: !member.status })
        .eq('id', member.id);
      if (error) throw error;

      setMembers(current =>
        current.map(m => (m.id === member.id ? { ...m, status: !m.status } : m))
      );

      toast({
        title: "Sucesso!",
        description: `Membro ${member.status ? 'desativado' : 'ativado'} com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do membro.",
        variant: "destructive",
      });
    } finally {
      setLoadingToggleId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2 select-none" tabIndex={0}>
          Membros
          <button
            aria-label="Ordenar membros por nome"
            onClick={toggleSort}
            className="text-gray-400 hover:text-fitpro-purple focus:outline-none focus:ring-2 focus:ring-fitpro-purple rounded"
            title={`Ordenar por nome (${sortAsc ? 'ascendente' : 'descendente'})`}
          >
            <ArrowUpDown className="w-5 h-5" />
          </button>
        </h1>
        <Button
          onClick={() => navigate('/members/new')}
          className="flex items-center gap-2 bg-fitpro-purple hover:bg-fitpro-darkPurple focus:ring-4 focus:ring-fitpro-purple/50"
          aria-label="Adicionar novo membro"
          title="Adicionar novo membro"
        >
          <PlusCircle className="h-5 w-5" />
          Novo Membro
        </Button>
      </header>

      <div className="max-w-md relative">
        <Search
          className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200
            ${searchTerm ? 'text-fitpro-purple' : 'text-gray-400'}`}
          aria-hidden="true"
        />
        <Input
          placeholder="Pesquisar por nome ou CPF/ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-lg border border-gray-300 shadow-sm placeholder-gray-400 focus:border-fitpro-purple focus:ring-2 focus:ring-fitpro-purple transition"
          aria-label="Campo de busca de membros"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <Table className="min-w-[720px]">
          <caption className="sr-only">Tabela de membros do sistema</caption>
          <TableHeader className="bg-gray-50 sticky top-0 z-10 select-none">
            <TableRow>
              <TableHead className="py-3 px-6 text-left text-gray-700">Nome</TableHead>
              <TableHead className="py-3 px-6 text-left text-gray-700">Plano</TableHead>
              <TableHead className="py-3 px-6 text-left text-gray-700">Entrada</TableHead>
              <TableHead className="py-3 px-6 text-left text-gray-700">Status</TableHead>
              <TableHead className="py-3 px-6 text-right text-gray-700">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20">
                  <svg
                    className="animate-spin mx-auto h-10 w-10 text-fitpro-purple"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-label="Carregando"
                    role="img"
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
                  <p className="mt-4 text-fitpro-purple font-semibold animate-pulse">Carregando membros...</p>
                </TableCell>
              </TableRow>
            ) : sortedMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16 text-gray-500 flex flex-col items-center gap-2 select-none">
                  <Search className="h-8 w-8 text-gray-400" aria-hidden="true" />
                  Nenhum membro encontrado
                </TableCell>
              </TableRow>
            ) : (
              sortedMembers.map((member, idx) => (
                <TableRow
                  key={member.id}
                  className={`transition-colors duration-200
                    ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    hover:bg-fitpro-purple/10 focus-within:bg-fitpro-purple/20`}
                  tabIndex={0}
                  role="row"
                  aria-rowindex={idx + 2}
                >
                  <TableCell className="font-semibold py-4 px-6">{member.full_name}</TableCell>
                  <TableCell className="py-4 px-6">{planNamesById.get(member.plan_id) ?? 'Desconhecido'}</TableCell>
                  <TableCell className="py-4 px-6">{new Date(member.entry_date).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="py-4 px-6">
                    <Badge
                      variant={member.status ? 'success' : 'destructive'}
                      aria-label={member.status ? 'Ativo' : 'Inativo'}
                      className="cursor-default select-none"
                    >
                      {member.status ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        aria-label="Abrir menu de ações do membro"
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white p-1 text-gray-500 hover:bg-gray-100 hover:text-fitpro-purple focus:outline-none focus:ring-2 focus:ring-fitpro-purple focus:ring-offset-1"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 bg-white shadow-md rounded-md p-1">
                        <DropdownMenuItem
                          onClick={() => navigate(`/members/view/${member.id}`)}
                          className="flex items-center gap-2 text-gray-700 hover:text-fitpro-purple"
                        >
                          <Eye className="h-4 w-4" /> Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate(`/members/edit/${member.id}`)}
                          className="flex items-center gap-2 text-gray-700 hover:text-fitpro-purple"
                        >
                          <Edit className="h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(member)}
                          disabled={loadingToggleId === member.id}
                          className="flex items-center gap-2 text-gray-700 hover:text-fitpro-purple disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {loadingToggleId === member.id ? (
                            <svg
                              className="animate-spin h-4 w-4 mr-2 text-fitpro-purple"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              aria-label="Carregando"
                              role="img"
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
                          ) : member.status ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                          {member.status ? 'Desativar' : 'Ativar'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Members;
