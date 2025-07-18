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
import { supabase, Member, Plan, Payment, validatePaymentStatus } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import {
  PlusCircle, Search, MoreHorizontal, Edit, Eye, UserX, UserCheck, ArrowUpDown, MessageCircle
} from 'lucide-react';

// Hook para carregar membros e planos
function useMembersAndPlans() {
  const [members, setMembers] = useState<(Member & { lastPayment: Payment | null })[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchLastPayments = useCallback(async (members: Member[]) => {
    const promises = members.map(async (member) => {
      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('member_id', member.id)
        .order('payment_date', { ascending: false })
        .limit(1)
        .single();
      
      return {
        ...member,
        lastPayment: data ? validatePaymentStatus(data) : null
      };
    });

    return Promise.all(promises);
  }, []);

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

      // Buscar o último pagamento para cada membro
      const membersWithPayments = await fetchLastPayments(membersData || []);

      setMembers(membersWithPayments);
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
  }, [toast, fetchLastPayments]);

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

  const normalizeCPF = (cpf: string) => cpf.replace(/\D/g, '');

  const planNamesById = useMemo(() => {
    const map = new Map<number, string>();
    plans.forEach(plan => map.set(plan.id, plan.name));
    return map;
  }, [plans]);

  const toggleSort = () => setSortAsc(prev => !prev);

  const filteredMembers = useMemo(() => {
    const termLower = searchTerm.toLowerCase();
    const normTerm = normalizeCPF(searchTerm);
    return members.filter(member =>
      member.full_name.toLowerCase().includes(termLower) ||
      normalizeCPF(member.cpf_id).includes(normTerm)
    );
  }, [members, searchTerm]);

  const sortedMembers = useMemo(() => {
    return [...filteredMembers].sort((a, b) =>
      sortAsc
        ? a.full_name.localeCompare(b.full_name)
        : b.full_name.localeCompare(a.full_name)
    );
  }, [filteredMembers, sortAsc]);

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

  const sendWhatsAppMessage = (member: Member) => {
    if (!member.phone) {
      toast({
        title: "Erro",
        description: "Este membro não possui número de telefone cadastrado.",
        variant: "destructive",
      });
      return;
    }

    const message = `Olá ${member.full_name}! Como você está?`;
    const cleanPhone = member.phone.replace(/[^\d]/g, '');
    const whatsappUrl = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');

    toast({
      title: "WhatsApp aberto!",
      description: `Foi aberto o WhatsApp Web para o membro ${member.full_name}.`,
    });
  };

  const dateOptions: Intl.DateTimeFormatOptions = { 
    timeZone: 'UTC', 
    month: 'numeric' as const, 
    day: 'numeric' as const, 
    year: 'numeric' as const 
  };

  const dateFormatter = new Intl.DateTimeFormat('pt-BR', dateOptions);

  // Função para buscar o último pagamento de cada membro
  const fetchLastPayments = useCallback(async (members: Member[]) => {
    const promises = members.map(async (member) => {
      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('member_id', member.id)
        .order('payment_date', { ascending: false })
        .limit(1)
        .single();
      
      return {
        ...member,
        lastPayment: data ? validatePaymentStatus(data) : null
      };
    });

    return Promise.all(promises);
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-white dark:bg-gray-900 transition-colors">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2 select-none" tabIndex={0}>
          Membros
          <button
            aria-label="Ordenar membros por nome"
            onClick={toggleSort}
            className="text-gray-400 dark:text-gray-300 hover:text-fitpro-purple dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-fitpro-purple rounded"
            title={`Ordenar por nome (${sortAsc ? 'ascendente' : 'descendente'})`}
          >
            <ArrowUpDown className="w-5 h-5" />
          </button>
        </h1>
        <Button
          onClick={() => navigate('/members/new')}
          className="flex items-center gap-2 bg-fitpro-purple hover:bg-fitpro-darkPurple dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white focus:ring-4 focus:ring-fitpro-purple/50 transition-colors"
          aria-label="Adicionar novo membro"
          title="Adicionar novo membro"
        >
          <PlusCircle className="h-5 w-5" />
          Novo Membro
        </Button>
      </header>

      <div className="max-w-md relative">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${searchTerm ? 'text-fitpro-purple dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`} />
        <Input
          placeholder="Pesquisar por nome ou CPF/ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-fitpro-purple focus:ring-2 focus:ring-fitpro-purple transition-colors"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <Table className="min-w-[720px]">
          <TableHeader className="bg-gray-50 dark:bg-zinc-800 sticky top-0 z-10 select-none transition-colors">
            <TableRow className="border-b border-gray-200 dark:border-gray-700">
              <TableHead className="py-3 px-6 text-gray-900 dark:text-white">Nome</TableHead>
              <TableHead className="py-3 px-6 text-gray-900 dark:text-white">Plano</TableHead>
              <TableHead className="py-3 px-6 text-gray-900 dark:text-white">Último Pagamento</TableHead>
              <TableHead className="py-3 px-6 text-gray-900 dark:text-white">Status Pagamento</TableHead>
              <TableHead className="py-3 px-6 text-gray-900 dark:text-white">Status</TableHead>
              <TableHead className="py-3 px-6 text-right text-gray-900 dark:text-white">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20">
                  <svg className="animate-spin mx-auto h-10 w-10 text-fitpro-purple" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <p className="mt-4 text-fitpro-purple font-semibold animate-pulse">Carregando membros...</p>
                </TableCell>
              </TableRow>
            ) : sortedMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-gray-500 flex flex-col items-center gap-2 select-none">
                  <Search className="h-8 w-8 text-gray-400" />
                  Nenhum membro encontrado
                </TableCell>
              </TableRow>
            ) : (
              sortedMembers.map((member, idx) => (
                <TableRow
                  key={member.id}
                  className={`${idx % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-gray-50 dark:bg-zinc-800'} hover:bg-fitpro-purple/10 dark:hover:bg-indigo-900 transition-colors`}
                >
                  <TableCell className="font-semibold py-4 px-6 text-gray-900 dark:text-white">{member.full_name}</TableCell>
                  <TableCell className="py-4 px-6 text-gray-900 dark:text-white">{planNamesById.get(member.plan_id) ?? 'Desconhecido'}</TableCell>
                  <TableCell className="py-4 px-6 text-gray-900 dark:text-white">
                    {member.lastPayment?.payment_date ? dateFormatter.format(new Date(member.lastPayment.payment_date)) : 'Nunca'}
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <Badge
                      variant={member.lastPayment?.status === 'paid' ? 'default' : 'destructive'}
                      className={member.lastPayment?.status === 'paid' ? 
        'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700' : 
        'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700'}
                    >
                      {member.lastPayment?.status === 'paid' ? 'Em dia' : 'Pendente'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <Badge variant={member.status ? 'default' : 'destructive'} className={member.status ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700" : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700"}>{member.status ? 'Ativo' : 'Inativo'}</Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition-colors">
                        <MoreHorizontal className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white shadow-lg transition-colors">
                        <DropdownMenuItem
                          onClick={() => navigate(`/members/view/${member.id}`)}
                          className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Eye className="h-4 w-4 text-gray-700 dark:text-gray-200" /> Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate(`/members/edit/${member.id}`)}
                          className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Edit className="h-4 w-4 text-indigo-700 dark:text-indigo-400" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => sendWhatsAppMessage(member)}
                          className="flex items-center gap-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 transition-colors"
                        >
                          <MessageCircle className="h-4 w-4" /> Enviar WhatsApp
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(member)}
                          disabled={loadingToggleId === member.id}
                          className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          {member.status ? <UserX className="h-4 w-4 text-red-600 dark:text-red-400" /> : <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />}
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
