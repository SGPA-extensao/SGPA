
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Users, CheckCircle, AlertCircle, BarChart } from 'lucide-react';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // This would be replaced by actual data fetching from Supabase
        // For now we'll use mock data
        
        // Mock active members count
        const { count: activeCount, error: activeError } = await supabase
          .from('members')
          .select('*', { count: 'exact', head: true })
          .eq('status', true);
          
        if (activeError) throw activeError;
        
        // Mock payments in good standing
        const { count: paidCount, error: paidError } = await supabase
          .from('payments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'paid');
          
        if (paidError) throw paidError;
        
        // Mock expiring plans
        const { count: expiringCount, error: expiringError } = await supabase
          .from('payments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
          
        if (expiringError) throw expiringError;
        
        // If we couldn't get real data, use mock data
        setStats({
          activeMembers: activeCount ?? 45,
          paidMembers: paidCount ?? 38,
          expiringPlans: expiringCount ?? 7,
        });
        
        // Mock attendance data
        setAttendanceData([
          { name: 'Segunda', count: 28 },
          { name: 'Terça', count: 35 },
          { name: 'Quarta', count: 42 },
          { name: 'Quinta', count: 38 },
          { name: 'Sexta', count: 29 },
          { name: 'Sábado', count: 15 },
          { name: 'Domingo', count: 0 },
        ]);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
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
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">
              Membros Ativos
            </CardTitle>
            <Users className="h-5 w-5 text-fitpro-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeMembers}</div>
            <p className="text-xs text-muted-foreground">
              +2 novos membros esta semana
            </p>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pagamentos em Dia
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.paidMembers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.paidMembers / stats.activeMembers) * 100)}% dos membros ativos
            </p>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">
              Planos a Vencer
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.expiringPlans}</div>
            <p className="text-xs text-muted-foreground">
              Vencem nos próximos 7 dias
            </p>
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
};

export default Dashboard;
