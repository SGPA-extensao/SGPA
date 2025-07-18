import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
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

// Hook sofisticado para alternar tema escuro/claro com sincronização e animação
function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else if (saved === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  // Sempre sincroniza a classe 'dark' ao mudar o estado
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return [isDark, setIsDark] as const;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDark, setIsDark] = useDarkMode();
  // Para animação de giro
  const [rotating, setRotating] = useState(false);

  const handleThemeToggle = () => {
    setRotating(true);
    setTimeout(() => setRotating(false), 400); // tempo igual à duração da animação
    setIsDark((prev) => !prev);
  };

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
    <div className="space-y-6 bg-fitpro-lightGray dark:bg-gray-900 min-h-screen transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Olá, {user?.email?.split('@')[0] || 'Administrador'}
          </h1>
          {/* Toggle de tema sofisticado, só aparece em md+ (desktop) */}
          <button
            onClick={handleThemeToggle}
            className={
              [
                "hidden md:inline-flex items-center justify-center w-12 h-12 rounded-full border-2",
                "border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400",
                "shadow-lg transition-all duration-400",
                isDark
                  ? "bg-gradient-to-tr from-zinc-800 via-zinc-900 to-indigo-900 hover:from-zinc-700 hover:to-indigo-800"
                  : "bg-gradient-to-tr from-yellow-100 via-white to-indigo-100 hover:from-yellow-200 hover:to-indigo-200",
              ].join(' ')
            }
            title={isDark ? 'Modo claro' : 'Modo escuro'}
            aria-label="Alternar tema"
            type="button"
            style={{ boxShadow: isDark ? '0 2px 16px 0 #23263a55' : '0 2px 16px 0 #e0e7ff55' }}
          >
            <span
              className={
                [
                  "transition-transform duration-400 ease-in-out",
                  rotating ? "rotate-180" : "rotate-0",
                  "flex items-center justify-center"
                ].join(' ')
              }
            >
              {isDark ? (
                <Sun className="w-7 h-7 text-yellow-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.7)]" />
              ) : (
                <Moon className="w-7 h-7 text-indigo-500 drop-shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
              )}
            </span>
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-300">
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
        <Card className="card-shadow cursor-pointer bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 transition-colors" onClick={() => setShowActiveModal(true)}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-200">
              Membros Ativos
            </CardTitle>
            <Users className="h-5 w-5 text-fitpro-purple dark:text-yellow-300" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeMembers}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">+2 novos membros esta semana</p>
          </CardContent>
        </Card>

        {/* Pagamentos em Dia */}
        <Card className="card-shadow cursor-pointer bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 transition-colors" onClick={() => setShowPaidModal(true)}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-200">
              Pagamentos em Dia
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-300" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.paidMembers}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              {stats.activeMembers > 0
                ? Math.round((stats.paidMembers / stats.activeMembers) * 100)
                : 0}
              % dos membros ativos
            </p>
          </CardContent>
        </Card>

        {/* Planos a Vencer */}
        <Card className="card-shadow cursor-pointer bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 transition-colors" onClick={() => setShowPendingModal(true)}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-200">
              Planos a Vencer
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-amber-500 dark:text-amber-300" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.expiringPlans}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Vencem nos próximos 7 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="card-shadow bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <BarChart className="h-5 w-5 text-fitpro-purple dark:text-yellow-300" />
              Frequência Semanal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={attendanceData}
                  style={{ background: isDark ? '#18181b' : '#fff', borderRadius: 8, padding: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#444' : '#e5e7eb'} />
                  <XAxis dataKey="name" stroke={isDark ? '#e5e7eb' : '#18181b'} tick={{ fill: isDark ? '#e5e7eb' : '#18181b', fontSize: 14 }} />
                  <YAxis stroke={isDark ? '#e5e7eb' : '#18181b'} tick={{ fill: isDark ? '#e5e7eb' : '#18181b', fontSize: 14 }} />
                  <Tooltip
                    contentStyle={{ background: isDark ? '#27272a' : '#fff', color: isDark ? '#fff' : '#18181b', border: '1px solid', borderColor: isDark ? '#444' : '#e5e7eb' }}
                    itemStyle={{ color: isDark ? '#fff' : '#18181b' }}
                  />
                  <Bar
                    dataKey="count"
                    fill={isDark ? '#facc15' : '#9b87f5'}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Membros Ativos</h2>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {activeMemberNames.length > 0 ? (
                activeMemberNames.map((name, index) => (
                  <li key={index} className="text-gray-800 dark:text-gray-200">{name}</li>
                ))
              ) : (
                <li className="text-gray-700 dark:text-gray-300">Nenhum membro ativo encontrado.</li>
              )}
            </ul>
            <button
              onClick={() => setShowActiveModal(false)}
              className="mt-4 px-4 py-2 bg-fitpro-purple text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:text-gray-100"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal Pagamentos em Dia */}
      {showPaidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Pagamentos em Dia</h2>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {paidMemberNames.length > 0 ? (
                paidMemberNames.map((name, index) => (
                  <li key={index} className="text-gray-800 dark:text-gray-200">{name}</li>
                ))
              ) : (
                <li className="text-gray-700 dark:text-gray-300">Nenhum pagamento em dia.</li>
              )}
            </ul>
            <button
              onClick={() => setShowPaidModal(false)}
              className="mt-4 px-4 py-2 bg-fitpro-purple text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:text-gray-100"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal Planos Pendentes */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Planos Pendentes</h2>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {pendingMembers.length > 0 ? (
                pendingMembers.map((name, index) => (
                  <li key={index} className="text-gray-800 dark:text-gray-200">{name}</li>
                ))
              ) : (
                <li className="text-gray-700 dark:text-gray-300">Nenhum membro com plano pendente.</li>
              )}
            </ul>
            <button
              onClick={() => setShowPendingModal(false)}
              className="mt-4 px-4 py-2 bg-fitpro-purple text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:text-gray-100"
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
