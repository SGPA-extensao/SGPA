import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  fetchMemberById,
  fetchPlans,
  fetchAttendanceByMemberId,
  fetchPaymentsByMemberId,
} from '@/lib/supabase';
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
  User,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '@/lib/supabase';

const MemberInfoCard = ({
  member,
  plan,
}: {
  member: Member;
  plan: Plan | null;
}) => (
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
          <p className="text-lg">{member.full_name}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">CPF/ID</p>
          <p>{member.cpf_id || '-'}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Telefone</p>
          <p>{member.phone || '-'}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Data de Entrada</p>
          <p>
            {member.entry_date
              ? new Date(member.entry_date).toLocaleDateString('pt-BR')
              : '-'}
          </p>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-500">Plano Atual</p>
          <p className="text-lg text-fitpro-darkPurple font-semibold">
            {plan?.name || '-'}
          </p>
          <p className="text-sm text-gray-500">
            {plan
              ? `R$ ${plan.price.toFixed(2)} / ${plan.duration_months} ${
                  plan.duration_months === 1 ? 'mês' : 'meses'
                }`
              : '-'}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const AttendanceChartCard = ({
  attendanceData,
}: {
  attendanceData: { date: string; value: number }[];
}) => (
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
            <YAxis allowDecimals={false} />
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
);

const PaymentsTabContent = ({ payments }: { payments: Payment[] }) => (
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
          <table className="w-full" aria-label="Tabela de histórico de pagamentos">
            <caption className="sr-only">Histórico de pagamentos do membro</caption>
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
                  <td className="py-3 px-4">
                    {new Date(payment.payment_date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4">R$ {payment.amount.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    {new Date(payment.next_payment_date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant="outline"
                      className={
                        payment.status === 'paid'
                          ? 'bg-green-100 text-green-800 hover:bg-green-100'
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                          : 'bg-red-100 text-red-800 hover:bg-red-100'
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
);

const NotesTabContent = ({ notes }: { notes?: string }) => (
  <Card className="card-shadow">
    <CardHeader>
      <CardTitle>Observações</CardTitle>
    </CardHeader>
    <CardContent>
      {notes ? (
        <p className="whitespace-pre-line">{notes}</p>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Nenhuma observação registrada
        </div>
      )}
    </CardContent>
  </Card>
);

const MemberProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [member, setMember] = useState<Member | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingToggleStatus, setLoadingToggleStatus] = useState(false);

  // Busca os dados do membro e dependências
  useEffect(() => {
    if (!id) return;

    const fetchMemberData = async () => {
      setIsLoading(true);
      try {
        const memberData = await fetchMemberById(id);

        if (!memberData) {
          toast({
            title: 'Erro',
            description: 'Membro não encontrado.',
            variant: 'destructive',
          });
          navigate('/members');
          return;
        }
        setMember(memberData);

        const planData = await fetchPlans();
        const memberPlan = planData.find((p) => p.id === memberData.plan_id) || null;
        setPlan(memberPlan);

        const attendanceData = await fetchAttendanceByMemberId(id);
        setAttendances(attendanceData);

        const paymentData = await fetchPaymentsByMemberId(id);
        setPayments(paymentData);
      } catch (error) {
        console.error('Error fetching member data:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do membro.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberData();
  }, [id, navigate, toast]);

  // Memoização dos dados para o gráfico para evitar recalcular toda renderização
  const attendanceData = useMemo(() => {
    if (!attendances) return [];

    // Últimos 30 dias, do mais antigo para o mais recente
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().slice(0, 10); // yyyy-mm-dd
    }).reverse();

    return last30Days.map((date) => {
      // Contar presenças do dia
      const count = attendances.filter(
        (a) => a.check_in_date?.slice(0, 10) === date
      ).length;

      return {
        date: new Date(date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        }),
        value: count,
      };
    });
  }, [attendances]);

  // Função para ativar/desativar membro
  const handleToggleStatus = async () => {
    if (!member) return;

    setLoadingToggleStatus(true);
    try {
      const updatedStatus = !member.status;
      const { error } = await supabase
        .from('members')
        .update({ status: updatedStatus })
        .eq('id', member.id);

      if (error) {
        throw error;
      }
      setMember({ ...member, status: updatedStatus });
      toast({
        title: 'Sucesso',
        description: `Membro ${
          updatedStatus ? 'ativado' : 'desativado'
        } com sucesso!`,
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status do membro.',
        variant: 'destructive',
      });
    } finally {
      setLoadingToggleStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Carregando dados...</p>
      </div>
    );
  }

  if (!member) {
    return null;
  }

  return (
    <main className="container max-w-7xl px-4 mx-auto space-y-8 py-6">
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          onClick={() => navigate('/members')}
          aria-label="Voltar para a lista de membros"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <h1 className="text-3xl font-semibold">{member.full_name}</h1>

        <Button
          onClick={() => navigate(`/members/edit/${member.id}`)}
          aria-label="Editar membro"
        >
          <Edit className="h-4 w-4" />
        </Button>

        <Button
          variant={member.status ? 'destructive' : 'default'}
          onClick={handleToggleStatus}
          disabled={loadingToggleStatus}
          aria-label={
            member.status
              ? 'Desativar membro'
              : 'Ativar membro'
          }
          aria-live="polite"
        >
          {loadingToggleStatus ? (
            <span className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-2 border-t-gray-700 rounded-full"></span>
          ) : member.status ? (
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
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <MemberInfoCard member={member} plan={plan} />
        <AttendanceChartCard attendanceData={attendanceData} />
      </section>

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments" aria-label="Histórico de pagamentos">
            <CreditCard className="mr-2 h-4 w-4" />
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="notes" aria-label="Observações do membro">
            <ClipboardList className="mr-2 h-4 w-4" />
            Observações
          </TabsTrigger>
        </TabsList>
        <TabsContent value="payments">
          <PaymentsTabContent payments={payments} />
        </TabsContent>
        <TabsContent value="notes">
          <NotesTabContent notes={member.notes} />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default MemberProfile;
