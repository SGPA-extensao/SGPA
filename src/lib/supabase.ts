import { supabase } from '@/integrations/supabase/client';

// ---------- Tipos ----------
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
  created_at: string;
};

export type trainings = {
  id: string;
  name: string;
  description?: string;
  duration: string; // ou number se preferir
  level: 'iniciante' | 'intermediario' | 'avancado';
  responsible: string;
  members: string[]; // array de IDs dos membros
  created_at: string;
};


export type AgendaEvent = {
  id: number; // Ajustado para string assumindo UUID, mude para number se for auto-increment
  title: string;
  date: string; // formato YYYY-MM-DD
  time: string; // formato HH:mm:ss
  responsible: string;
  created_at: string;
};

// ---------- Exporta Supabase ----------
export { supabase };

// ---------- Members ----------
export const fetchMembers = async (): Promise<Member[]> => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('full_name', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const fetchMemberById = async (id: string): Promise<Member | null> => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createMember = async (member: Omit<Member, 'id' | 'created_at'>): Promise<Member> => {
  const { data, error } = await supabase
    .from('members')
    .insert([member])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateMember = async (
  id: string,
  member: Partial<Omit<Member, 'id' | 'created_at'>>
): Promise<Member> => {
  const { data, error } = await supabase
    .from('members')
    .update(member)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const toggleMemberStatus = async (id: string, status: boolean): Promise<Member> => {
  const { data, error } = await supabase
    .from('members')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteMember = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// ---------- Plans ----------
export const fetchPlans = async (): Promise<Plan[]> => {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
};

// ---------- Attendance ----------
export const fetchAttendanceByMemberId = async (memberId: string): Promise<Attendance[]> => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('member_id', memberId)
    .order('check_in_date', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const fetchAttendanceByDate = async (date: string): Promise<Attendance[]> => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .gte('check_in_date', `${date}T00:00:00`)
    .lt('check_in_date', `${date}T23:59:59`);

  if (error) throw error;
  return data || [];
};

export const registerAttendance = async (memberId: string, date: string): Promise<Attendance> => {
  const { data, error } = await supabase
    .from('attendance')
    .insert([{ member_id: memberId, check_in_date: `${date}T12:00:00Z` }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const registerAttendanceToday = async (memberId: string): Promise<Attendance> => {
  const today = new Date().toISOString().split('T')[0];
  return registerAttendance(memberId, today);
};

export const deleteAttendance = async (memberId: string, date: string): Promise<boolean> => {
  const { error } = await supabase
    .from('attendance')
    .delete()
    .eq('member_id', memberId)
    .gte('check_in_date', `${date}T00:00:00`)
    .lt('check_in_date', `${date}T23:59:59`);

  if (error) throw error;
  return true;
};

// ---------- Payments ----------
type RawPayment = Omit<Payment, 'status'> & { status: string | null | undefined };

const validatePaymentStatus = (payment: RawPayment): Payment => {
  const status = ['paid', 'pending', 'overdue'].includes(payment.status ?? '')
    ? (payment.status as Payment['status'])
    : 'pending';

  return { ...payment, status };
};

export const fetchPaymentsByMemberId = async (memberId: string): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('member_id', memberId)
    .order('payment_date', { ascending: false });

  if (error) throw error;

  return (data || []).map(validatePaymentStatus);
};

export const createPayment = async (payment: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> => {
  const { data, error } = await supabase
    .from('payments')
    .insert([payment])
    .select()
    .single();

  if (error) throw error;
  return validatePaymentStatus(data);
};

export const updatePayment = async (
  id: string,
  payment: Partial<Omit<Payment, 'id' | 'created_at'>>
): Promise<Payment> => {
  const { data, error } = await supabase
    .from('payments')
    .update(payment)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return validatePaymentStatus(data);
};


// ---------- Agenda ----------
export const fetchAgendaEvents = async (): Promise<AgendaEvent[]> => {
  const { data, error } = await supabase
    .from('agenda')
    .select('*')
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createAgendaEvent = async (
  event: Omit<AgendaEvent, 'id' | 'created_at'>
): Promise<AgendaEvent> => {
  const { data, error } = await supabase
    .from('agenda')
    .insert([event])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAgendaEvent = async (
  id: number,
  event: Partial<Omit<AgendaEvent, 'id' | 'created_at'>>
): Promise<AgendaEvent> => {
  const { data, error } = await supabase
    .from('agenda')
    .update(event)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteAgendaEvent = async (id: number): Promise<boolean> => {
  const { error } = await supabase
    .from('agenda')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};
export const createTraining = async (
  training: Omit<trainings, 'id' | 'created_at'>
): Promise<trainings> => {
  const { data, error } = await supabase
    .from('trainings')
    .insert([training])
    .select()
    .single();

  if (error) throw error;
  return data;
};
export const fetchTrainings = async (): Promise<trainings[]> => {
  const { data, error } = await supabase
    .from('trainings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

