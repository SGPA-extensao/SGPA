import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchMemberById, fetchPlans, fetchAttendanceByMemberId, fetchPaymentsByMemberId } from '@/lib/supabase';
import { Member, Plan, Attendance, Payment } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { 
  ArrowLeft,
  Edit,
  UserX,
  UserCheck,
  CalendarDays,
  CreditCard,
  ClipboardList,
  User
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';

const MemberProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [member, setMember] = useState<Member | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendanceData, setAttendanceData] = useState<{ date: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMemberData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Fetch member data
        const memberData = await fetchMemberById(id);
        
        if (memberData) {
          setMember(memberData);
          
          // Fetch plan data
          const planData = await fetchPlans();
          const memberPlan = planData.find(p => p.id === memberData.plan_id) || null;
          setPlan(memberPlan);
          
          // Fetch attendance data
          const attendanceData = await fetchAttendanceByMemberId(id);
          setAttendances(attendanceData);
          
          // Generate attendance chart data
          const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
          }).reverse();
          
          const chartData = last30Days.map(date => {
            // Count attendances for this date
            const count = (attendanceData || []).filter(a => 
              new Date(a.check_in_date).toISOString().split('T')[0] === date
            ).length;
            
            return {
              date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
              value: count
            };
          });
          
          setAttendanceData(chartData);
          
          // Fetch payment data
          const paymentData = await fetchPaymentsByMemberId(id);
          setPayments(paymentData);
        } else {
          toast({
            title: "Erro",
            description: "Membro não encontrado.",
            variant: "destructive",
          });
          navigate('/members');
        }
      } catch (error) {
        console.error('Error fetching member data:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do membro.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberData();
  }, [id, navigate, toast]);

  const handleToggleStatus = async () => {
    if (!member) return;
    
    try {
      const { error } = await supabase
        .from('members')
        .update({ status: !member.status })
        .eq('id', member.id);
        
      if (error) throw error;
      
      setMember({
        ...member,
        status: !member.status
      });
      
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fitpro-purple"></div>
      </div>
    );
  }

  if (!member) {
    return <div>Membro não encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/members')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">
            {member?.full_name}
          </h1>
          <Badge 
            variant={member?.status ? "default" : "outline"}
            className={member?.status 
              ? "bg-green-100 text-green-800 hover:bg-green-100 ml-2"
              : "bg-gray-100 text-gray-800 hover:bg-gray-100 ml-2"
            }
          >
            {member?.status ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={member?.status ? "destructive" : "default"}
            onClick={handleToggleStatus}
          >
            {member?.status ? (
              <>
                <UserX className="mr-2 h-4 w-4" />
                Desativar
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Ativar
              </>
            )}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate(`/members/edit/${member?.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Membro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nome Completo</p>
                <p className="text-lg">{member?.full_name}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">CPF/ID</p>
                <p>{member?.cpf_id}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Telefone</p>
                <p>{member?.phone || '-'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Data de Entrada</p>
                <p>{member?.entry_date ? new Date(member.entry_date).toLocaleDateString('pt-BR') : '-'}</p>
              </div>
              
              <div className="pt-2 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-500">Plano Atual</p>
                <p className="text-lg text-fitpro-darkPurple font-semibold">{plan?.name || '-'}</p>
                <p className="text-sm text-gray-500">{plan ? `R$ ${plan.price.toFixed(2)} / ${plan.duration_months} ${plan.duration_months === 1 ? 'mês' : 'meses'}` : '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Frequência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#9b87f5" 
                    strokeWidth={2}
                    name="Presenças" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Pagamentos</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span>Observações</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="payments">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Histórico de Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum pagamento registrado
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4">Data</th>
                        <th className="text-left py-3 px-4">Valor</th>
                        <th className="text-left py-3 px-4">Próximo Pagamento</th>
                        <th className="text-left py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id} className="border-b border-gray-100">
                          <td className="py-3 px-4">{new Date(payment.payment_date).toLocaleDateString('pt-BR')}</td>
                          <td className="py-3 px-4">R$ {payment.amount.toFixed(2)}</td>
                          <td className="py-3 px-4">{new Date(payment.next_payment_date).toLocaleDateString('pt-BR')}</td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant="outline"
                              className={
                                payment.status === 'paid' 
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : payment.status === 'pending'
                                    ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                    : "bg-red-100 text-red-800 hover:bg-red-100"
                              }
                            >
                              {payment.status === 'paid' 
                                ? 'Pago' 
                                : payment.status === 'pending'
                                  ? 'Pendente'
                                  : 'Atrasado'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              {member?.notes ? (
                <p className="whitespace-pre-line">{member.notes}</p>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma observação registrada
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MemberProfile;
