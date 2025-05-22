
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type Member = {
  id: string;
  full_name: string;
  cpf_id: string;
  phone: string;
  entry_date: string;
  plan_id: number;
  status: boolean;
  notes?: string;
  created_at: string;
};

export type Plan = {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration_months: number;
};

export type Attendance = {
  id: string;
  member_id: string;
  check_in_date: string;
};

export type Payment = {
  id: string;
  member_id: string;
  amount: number;
  payment_date: string;
  next_payment_date: string;
  status: 'paid' | 'pending' | 'overdue';
};

// Exportando o supabase do integrations/supabase/client para uso em toda a aplicação
export { supabase };

export const fetchMembers = async () => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('full_name', { ascending: true });
    
  if (error) {
    console.error('Erro ao buscar membros:', error);
    throw error;
  }
  
  return data || [];
};

export const fetchMemberById = async (id: string) => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Erro ao buscar membro:', error);
    throw error;
  }
  
  return data;
};

export const createMember = async (member: Omit<Member, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('members')
    .insert([member])
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao criar membro:', error);
    throw error;
  }
  
  return data;
};

export const updateMember = async (id: string, member: Partial<Omit<Member, 'id' | 'created_at'>>) => {
  const { data, error } = await supabase
    .from('members')
    .update(member)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao atualizar membro:', error);
    throw error;
  }
  
  return data;
};

export const toggleMemberStatus = async (id: string, status: boolean) => {
  const { data, error } = await supabase
    .from('members')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao alterar status do membro:', error);
    throw error;
  }
  
  return data;
};

export const deleteMember = async (id: string) => {
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Erro ao excluir membro:', error);
    throw error;
  }
  
  return true;
};

export const fetchPlans = async () => {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .order('name', { ascending: true });
    
  if (error) {
    console.error('Erro ao buscar planos:', error);
    throw error;
  }
  
  return data || [];
};

export const fetchAttendanceByMemberId = async (memberId: string) => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('member_id', memberId)
    .order('check_in_date', { ascending: false });
    
  if (error) {
    console.error('Erro ao buscar registros de presença:', error);
    throw error;
  }
  
  return data || [];
};

export const registerAttendance = async (memberId: string) => {
  const { data, error } = await supabase
    .from('attendance')
    .insert([{ member_id: memberId }])
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao registrar presença:', error);
    throw error;
  }
  
  return data;
};

export const fetchPaymentsByMemberId = async (memberId: string) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('member_id', memberId)
    .order('payment_date', { ascending: false });
    
  if (error) {
    console.error('Erro ao buscar pagamentos:', error);
    throw error;
  }
  
  // Garantir que o status do pagamento está entre os valores permitidos
  const validPayments = (data || []).map(payment => {
    // Verificar se o status é válido, caso contrário converter para um valor válido
    let validStatus: 'paid' | 'pending' | 'overdue' = 'pending';
    
    if (payment.status === 'paid' || payment.status === 'pending' || payment.status === 'overdue') {
      validStatus = payment.status as 'paid' | 'pending' | 'overdue';
    }
    
    return {
      ...payment,
      status: validStatus
    } as Payment;
  });
  
  return validPayments;
};

export const createPayment = async (payment: Omit<Payment, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('payments')
    .insert([payment])
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao criar pagamento:', error);
    throw error;
  }
  
  return data;
};

export const updatePayment = async (id: string, payment: Partial<Omit<Payment, 'id' | 'created_at'>>) => {
  const { data, error } = await supabase
    .from('payments')
    .update(payment)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao atualizar pagamento:', error);
    throw error;
  }
  
  return data;
};
