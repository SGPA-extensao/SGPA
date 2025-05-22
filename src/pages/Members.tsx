
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Member, Plan } from '@/lib/supabase';
import { 
  PlusCircle, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  UserX, 
  UserCheck 
} from 'lucide-react';

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch from Supabase
        // For now, we'll use mock data
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .order('full_name', { ascending: true });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setMembers(data);
        } else {
          // Mock data if no real data exists
          setMembers([
            {
              id: '1',
              full_name: 'Ana Silva',
              cpf_id: '123.456.789-00',
              phone: '(11) 98765-4321',
              entry_date: '2023-01-15',
              plan_id: 1,
              status: true,
              created_at: '2023-01-15T10:00:00Z'
            },
            {
              id: '2',
              full_name: 'Bruno Oliveira',
              cpf_id: '987.654.321-00',
              phone: '(11) 91234-5678',
              entry_date: '2023-02-20',
              plan_id: 2,
              status: true,
              created_at: '2023-02-20T14:30:00Z'
            },
            {
              id: '3',
              full_name: 'Carolina Lima',
              cpf_id: '456.789.123-00',
              phone: '(11) 97890-1234',
              entry_date: '2023-03-10',
              plan_id: 1,
              status: false,
              created_at: '2023-03-10T09:15:00Z'
            }
          ]);
        }
        
        // Fetch plans
        const { data: plansData, error: plansError } = await supabase
          .from('plans')
          .select('*');
          
        if (plansError) throw plansError;
        
        if (plansData && plansData.length > 0) {
          setPlans(plansData);
        } else {
          // Mock plans data if no real data exists
          setPlans([
            { id: 1, name: 'Mensal', description: 'Plano mensal básico', price: 100, duration_months: 1 },
            { id: 2, name: 'Trimestral', description: 'Plano trimestral com desconto', price: 270, duration_months: 3 },
            { id: 3, name: 'Anual', description: 'Plano anual com grande desconto', price: 960, duration_months: 12 }
          ]);
        }
        
      } catch (error) {
        console.error('Error fetching members:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os membros.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [toast]);

  const getPlanName = (planId: number) => {
    const plan = plans.find(p => p.id === planId);
    return plan ? plan.name : 'Desconhecido';
  };

  const handleToggleStatus = async (member: Member) => {
    try {
      const { error } = await supabase
        .from('members')
        .update({ status: !member.status })
        .eq('id', member.id);
        
      if (error) throw error;
      
      setMembers(members.map(m => 
        m.id === member.id ? {...m, status: !m.status} : m
      ));
      
      toast({
        title: "Sucesso!",
        description: `Membro ${member.status ? 'desativado' : 'ativado'} com sucesso.`,
      });
    } catch (error) {
      console.error('Error toggling member status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do membro.",
        variant: "destructive",
      });
    }
  };

  const filteredMembers = members.filter(member => 
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    member.cpf_id.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Membros</h1>
        <Button 
          onClick={() => navigate('/members/new')}
          className="bg-fitpro-purple hover:bg-fitpro-darkPurple"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Membro
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Pesquisar por nome ou CPF/ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-md border overflow-hidden card-shadow">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitpro-purple"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Nenhum membro encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.full_name}</TableCell>
                  <TableCell>{getPlanName(member.plan_id)}</TableCell>
                  <TableCell>{new Date(member.entry_date).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={member.status ? "default" : "outline"}
                      className={member.status 
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                      }
                    >
                      {member.status ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        <DropdownMenuItem 
                          onClick={() => navigate(`/members/view/${member.id}`)}
                          className="cursor-pointer flex items-center"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Visualizar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => navigate(`/members/edit/${member.id}`)}
                          className="cursor-pointer flex items-center"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleToggleStatus(member)}
                          className="cursor-pointer flex items-center"
                        >
                          {member.status ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              <span>Desativar</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              <span>Ativar</span>
                            </>
                          )}
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
