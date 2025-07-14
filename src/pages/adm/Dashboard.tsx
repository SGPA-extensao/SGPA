import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Users, CheckCircle, AlertCircle, BarChart } from 'lucide-react';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface DashboardStats {
  activeMembers: number;
  paidMembers: number;
  expiringPlans: number;
}

interface AttendanceData {
  name: string;
  count: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [stats, setStats] = useState<DashboardStats>({
    activeMembers: 0,
    paidMembers: 0,
    expiringPlans: 0,
  });

  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [pendingMembers, setPendingMembers] = useState<string[]>([]);
  const [activeMemberNames, setActiveMemberNames] = useState<string[]>([]);
  const [paidMemberNames, setPaidMemberNames] = useState<string[]>([]);

  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showActiveModal, setShowActiveModal] = useState(false);
  const [showPaidModal, setShowPaidModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Membros ativos
        const { data: activeMembersData, count: activeCount, error: activeError } = await supabase
          .from('members')
          .select('full_name', { count: 'exact' })
          .eq('status', true);

        if (activeError) throw activeError;
        const activeNames = activeMembersData?.map((item) => item.full_name) ?? [];
        setActiveMemberNames(activeNames);

        // Pagamentos em dia
        const { data: paidMembersData, count: paidCount, error: paidError } = await supabase
          .from('payments')
          .select('member_id, members(full_name)', { count: 'exact' })
          .eq('status', 'paid');

        if (paidError) throw paidError;
        const paidNames = paidMembersData?.map((item) => item.members?.full_name) ?? [];
        setPaidMemberNames(paidNames);

        // Planos pendentes
        const { data: pendingData, count: expiringCount, error: expiringError } = await supabase
          .from('payments')
          .select('member_id, members(full_name)', { count: 'exact' })
          .eq('status', 'pending');

        if (expiringError) throw expiringError;
        const pendingNames = pendingData?.map(item => item.members?.full_name) ?? [];
        setPendingMembers(pendingNames);

        setStats({
          activeMembers: activeCount ?? 0,
          paidMembers: paidCount ?? 0,
          expiringPlans: expiringCount ?? 0,
        });

        // Frequência semanal
        const today = new Date();
        const dayOfWeek = today.getDay();
        const sunday = new Date(today);
        sunday.setDate(today.getDate() - dayOfWeek);
        const saturday = new Date(sunday);
        saturday.setDate(sunday.getDate() + 6);

        const startDate = sunday.toISOString().slice(0, 10);
        const endDate = saturday.toISOString().slice(0, 10);

        const { data: attendance, error: attendanceError } = await supabase
          .from('attendance')
          .select('check_in_date')
          .gte('check_in_date', startDate)
          .lte('check_in_date', endDate)
          .order('check_in_date', { ascending: true });

        if (attendanceError) throw attendanceError;

        const countByDate: Record<string, number> = {};
        attendance?.forEach((item) => {
          const day = item.check_in_date?.substring(0, 10);
          if (day) countByDate[day] = (countByDate[day] || 0) + 1;
        });

        const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const weeklyData: AttendanceData[] = [];

        for (let i = 0; i < 7; i++) {
          const date = new Date(sunday);
          date.setDate(sunday.getDate() + i);
          const dateStr = date.toISOString().slice(0, 10);
          weeklyData.push({
            name: dayNames[date.getDay()],
            count: countByDate[dateStr] || 0,
          });
        }

        setAttendanceData(weeklyData);

      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do dashboard.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fitpro-purple"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">
          Olá, {user?.email?.split('@')[0] || 'Administrador'}
        </h1>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Membros Ativos */}
        <Card className="card-shadow cursor-pointer" onClick={() => setShowActiveModal(true)}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">
              Membros Ativos
            </CardTitle>
            <Users className="h-5 w-5 text-fitpro-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeMembers}</div>
            <p className="text-xs text-muted-foreground">+2 novos membros esta semana</p>
          </CardContent>
        </Card>

        {/* Pagamentos em Dia */}
        <Card className="card-shadow cursor-pointer" onClick={() => setShowPaidModal(true)}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pagamentos em Dia
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.paidMembers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeMembers > 0
                ? Math.round((stats.paidMembers / stats.activeMembers) * 100)
                : 0}
              % dos membros ativos
            </p>
          </CardContent>
        </Card>

        {/* Planos a Vencer */}
        <Card className="card-shadow cursor-pointer" onClick={() => setShowPendingModal(true)}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">
              Planos a Vencer
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.expiringPlans}</div>
            <p className="text-xs text-muted-foreground">Vencem nos próximos 7 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Frequência Semanal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    fill="#9b87f5"
                    radius={[4, 4, 0, 0]}
                    name="Frequência"
                  />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Membros Ativos */}
      {showActiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Membros Ativos</h2>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {activeMemberNames.length > 0 ? (
                activeMemberNames.map((name, index) => (
                  <li key={index} className="text-gray-800">{name}</li>
                ))
              ) : (
                <li>Nenhum membro ativo encontrado.</li>
              )}
            </ul>
            <button
              onClick={() => setShowActiveModal(false)}
              className="mt-4 px-4 py-2 bg-fitpro-purple text-white rounded hover:bg-purple-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal Pagamentos em Dia */}
      {showPaidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Pagamentos em Dia</h2>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {paidMemberNames.length > 0 ? (
                paidMemberNames.map((name, index) => (
                  <li key={index} className="text-gray-800">{name}</li>
                ))
              ) : (
                <li>Nenhum pagamento em dia.</li>
              )}
            </ul>
            <button
              onClick={() => setShowPaidModal(false)}
              className="mt-4 px-4 py-2 bg-fitpro-purple text-white rounded hover:bg-purple-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal Planos Pendentes */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Planos Pendentes</h2>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {pendingMembers.length > 0 ? (
                pendingMembers.map((name, index) => (
                  <li key={index} className="text-gray-800">{name}</li>
                ))
              ) : (
                <li>Nenhum membro com plano pendente.</li>
              )}
            </ul>
            <button
              onClick={() => setShowPendingModal(false)}
              className="mt-4 px-4 py-2 bg-fitpro-purple text-white rounded hover:bg-purple-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
