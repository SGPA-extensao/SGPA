
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { Member, Plan } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Save, ArrowLeft, Trash } from 'lucide-react';

const formSchema = z.object({
  full_name: z.string().min(3, {
    message: "Nome deve ter pelo menos 3 caracteres.",
  }),
  cpf_id: z.string().min(11, {
    message: "CPF/ID deve ter pelo menos 11 caracteres.",
  }),
  phone: z.string().optional(),
  entry_date: z.string(),
  plan_id: z.string(),
  status: z.boolean().default(true),
  notes: z.string().optional(),
});

const MemberForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!id;

  // Define form with validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      cpf_id: "",
      phone: "",
      entry_date: new Date().toISOString().split('T')[0],
      plan_id: "",
      status: true,
      notes: "",
    },
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .order('name', { ascending: true });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setPlans(data);
        } else {
          // Mock data if no real data exists
          setPlans([
            { id: 1, name: 'Mensal', description: 'Plano mensal básico', price: 100, duration_months: 1 },
            { id: 2, name: 'Trimestral', description: 'Plano trimestral com desconto', price: 270, duration_months: 3 },
            { id: 3, name: 'Anual', description: 'Plano anual com grande desconto', price: 960, duration_months: 12 }
          ]);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os planos.",
          variant: "destructive",
        });
      }
    };

    const fetchMember = async () => {
      if (!isEditing) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          // Format date to YYYY-MM-DD for input
          const formattedDate = new Date(data.entry_date).toISOString().split('T')[0];
          
          form.reset({
            full_name: data.full_name,
            cpf_id: data.cpf_id,
            phone: data.phone || '',
            entry_date: formattedDate,
            plan_id: String(data.plan_id),
            status: data.status,
            notes: data.notes || '',
          });
        } else {
          toast({
            title: "Erro",
            description: "Membro não encontrado.",
            variant: "destructive",
          });
          navigate('/members');
        }
      } catch (error) {
        console.error('Error fetching member:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do membro.",
          variant: "destructive",
        });
        navigate('/members');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
    fetchMember();
  }, [id, isEditing, navigate, toast, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    try {
      const memberData = {
        full_name: values.full_name,
        cpf_id: values.cpf_id,
        phone: values.phone,
        entry_date: values.entry_date,
        plan_id: parseInt(values.plan_id),
        status: values.status,
        notes: values.notes,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('members')
          .update(memberData)
          .eq('id', id);
          
        if (error) throw error;
        
        toast({
          title: "Sucesso!",
          description: "Membro atualizado com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('members')
          .insert([memberData]);
          
        if (error) throw error;
        
        toast({
          title: "Sucesso!",
          description: "Membro cadastrado com sucesso.",
        });
      }
      
      navigate('/members');
    } catch (error) {
      console.error('Error saving member:', error);
      toast({
        title: "Erro",
        description: `Não foi possível ${isEditing ? 'atualizar' : 'cadastrar'} o membro.`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;
    
    if (!window.confirm('Tem certeza que deseja excluir este membro?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Sucesso!",
        description: "Membro excluído com sucesso.",
      });
      navigate('/members');
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o membro.",
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
            {isEditing ? 'Editar Membro' : 'Cadastrar Membro'}
          </h1>
        </div>
        
        {isEditing && (
          <Button 
            variant="destructive" 
            onClick={handleDelete}
          >
            <Trash className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        )}
      </div>

      <div className="bg-white rounded-md p-6 card-shadow">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo do membro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cpf_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF/ID</FormLabel>
                    <FormControl>
                      <Input placeholder="CPF ou documento de identificação" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="entry_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Entrada</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="plan_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plano</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um plano" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={String(plan.id)}>
                            {plan.name} - R$ {plan.price.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Status</FormLabel>
                      <div className="text-sm text-gray-500">
                        {field.value ? 'Membro Ativo' : 'Membro Inativo'}
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações adicionais sobre o membro" 
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/members')}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isSaving}
                className="bg-fitpro-purple hover:bg-fitpro-darkPurple"
              >
                {isSaving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </div>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? 'Salvar Alterações' : 'Cadastrar'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default MemberForm;
