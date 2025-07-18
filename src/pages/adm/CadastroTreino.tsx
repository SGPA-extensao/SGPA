import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Certifique-se de que este caminho está correto
import { useToast } from '@/components/ui/use-toast'; // Certifique-se de que este caminho está correto
import { Button } from '@/components/ui/button'; // Certifique-se de que este caminho está correto
import { jsPDF } from 'jspdf'; // Importe o jsPDF

// Definindo as interfaces para melhor tipagem
interface Member {
  id: string;
  full_name: string;
}

// Tipos literais para as categorias e níveis para garantir consistência
type TrainingCategory = '' | 'membros_inferiores' | 'membros_sup_costas' | 'membros_sup' | 'antebraco';
type TrainingLevel = '' | 'iniciante' | 'intermediario' | 'avancado';

interface Training {
  id?: string; // Opcional, pois pode não existir ao inserir
  name: string;
  description: string;
  duration: string;
  level: TrainingLevel extends '' ? never : TrainingLevel; // Garante que 'level' não seja vazio no DB
  responsible: string;
  members: string[];
  category: TrainingCategory extends '' ? never : TrainingCategory; // Garante que 'category' não seja vazio no DB
  created_at: string;
}

const CadastroTreino = () => {
  // State para filtro de nome de associado no modal
  const [filterMemberName, setFilterMemberName] = useState('');
  const { toast } = useToast();

  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [level, setLevel] = useState<TrainingLevel>(''); // Usando o tipo literal
  const [responsible, setResponsible] = useState('');
  const [category, setCategory] = useState<TrainingCategory>(''); // NOVO ESTADO PARA CATEGORIA

  const [loading, setLoading] = useState(false); // Para carregar membros e treinos
  const [saving, setSaving] = useState(false);   // Para o processo de salvar

  const [savedTrainings, setSavedTrainings] = useState<Training[]>([]);

  const [showModal, setShowModal] = useState(false); // Modal pós-cadastro
  const [modalData, setModalData] = useState<
    { studentName: string; trainingName: string; description: string }[]
  >([]);

  const [viewModal, setViewModal] = useState(false); // Modal de visualização geral

  useEffect(() => {
    const fetchMembersAndTrainings = async () => {
      setLoading(true);
      // Carregar membros
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('id, full_name')
        .order('full_name');

      if (membersError) {
        toast({ title: 'Erro', description: 'Falha ao carregar membros.', variant: 'destructive' });
      } else {
        setMembers(membersData || []);
      }

      // Carregar treinos existentes (para a visualização e PDF)
      const { data: trainingsData, error: trainingsError } = await supabase
        .from('trainings')
        .select('*') // Seleciona todos os campos do treino
        .order('created_at', { ascending: false });

      if (trainingsError) {
        toast({ title: 'Erro', description: 'Falha ao carregar treinos salvos.', variant: 'destructive' });
      } else {
        // Garante que todos os treinos tenham o campo category
        setSavedTrainings((trainingsData || []).map(t => ({
          ...t,
          category: 'category' in t ? (t as any).category ?? '' : ''
        })));
      }

      setLoading(false);
    };
    fetchMembersAndTrainings();
  }, [toast]);

  // Corrigido: só permite selecionar um aluno por vez
  const toggleMember = (id: string) => {
    setSelectedMember(id);
  };

  const handleSubmit = async () => {
    // VALIDAÇÃO: Adicionado 'category'
    if (!name || !description || (!durationHours && !durationMinutes) || !level || !responsible || !category) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor, preencha todos os campos.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedMember) {
      toast({
        title: 'Nenhum aluno selecionado',
        description: 'Selecione um aluno para o treino.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    const hours = Number(durationHours) || 0;
    const minutes = Number(durationMinutes) || 0;
    const totalMinutes = hours * 60 + minutes;
    if (isNaN(hours) || isNaN(minutes) || totalMinutes <= 0) {
      toast({
        title: 'Duração inválida',
        description: 'Informe uma duração válida (horas ou minutos).',
        variant: 'destructive',
      });
      setSaving(false);
      return;
    }

    // A validação acima já garante que 'level' e 'category' não são vazios.
    // Podemos fazer o casting seguro para os tipos não-vazios
    const finalLevel = level as Exclude<TrainingLevel, ''>;
    const finalCategory = category as Exclude<TrainingCategory, ''>;


    try {
      const newTrainingData = {
        name,
        description,
        duration: totalMinutes.toString(),
        level: finalLevel,
        responsible,
        members: [selectedMember],
        category: finalCategory, // NOVO CAMPO: ENVIANDO PARA O SUPABASE
        created_at: new Date().toISOString(),
      };

      // Inserir os dados e selecionar o registro inserido para obter o ID gerado pelo DB
      const { data, error } = await supabase.from('trainings').insert([newTrainingData]).select();

      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Treino cadastrado com sucesso!' });

      // Se a inserção foi bem-sucedida, atualiza o estado de treinos salvos com o novo treino
      if (data && data.length > 0) {
        setSavedTrainings(prev => [data[0] as Training, ...prev]);
      }

      // Prepara os dados para o modal de sucesso
      const member = members.find(m => m.id === selectedMember);
      setModalData([
        {
          studentName: member?.full_name || 'Aluno desconhecido',
          trainingName: name,
          description,
        },
      ]);
      setShowModal(true); // Abre o modal de sucesso

      // Resetar os campos do formulário
      setName('');
      setDescription('');
      setDurationHours('');
      setDurationMinutes('');
      setLevel('');
      setResponsible('');
      setCategory(''); // RESETAR O CAMPO DE CATEGORIA
      setSelectedMember('');

    } catch (error: any) {
      toast({ title: 'Erro', description: `Falha ao salvar treino: ${error.message}`, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Função auxiliar para formatar a string da categoria/nível para exibição no PDF e UI
  const formatTextForDisplay = (text: string) => {
    if (!text) return '';
    return text
      .replace(/_/g, ' ') // Substitui underscores por espaços
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitaliza a primeira letra de cada palavra
  };

  // Função para exportar o treino para PDF com layout aprimorado
  const handleExportPdf = (training: Training) => {
    const doc = new jsPDF();
    let yPos = 20; // Posição Y inicial
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;

    // --- Cabeçalho ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('Academia Movimento e Forma Fitness', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(16);
    doc.text('Ficha de Treino Personalizado', pageWidth / 2, yPos, { align: 'center' });
    yPos += 20; // Espaço após o cabeçalho

    // --- Detalhes do Treino ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Dados do Treino:', margin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(`Nome do Treino: ${training.name}`, margin, yPos);
    yPos += 7;
    doc.text(`Categoria: ${formatTextForDisplay(training.category)}`, margin, yPos); // USANDO A FUNÇÃO DE FORMATAÇÃO
    yPos += 7;
    // Exibir duração em horas e minutos
    const durationNum = Number(training.duration);
    const h = Math.floor(durationNum / 60);
    const m = durationNum % 60;
    let durationStr = '';
    if (h > 0) durationStr += `${h}h`;
    if (m > 0) durationStr += (durationStr ? ' ' : '') + `${m}min`;
    doc.text(`Duração Estimada: ${durationStr}`, margin, yPos);
    yPos += 7;
    doc.text(`Nível: ${formatTextForDisplay(training.level)}`, margin, yPos); // USANDO A FUNÇÃO DE FORMATAÇÃO
    yPos += 7;
    doc.text(`Responsável: ${training.responsible}`, margin, yPos);
    yPos += 7;
    doc.text(`Data de Criação: ${new Date(training.created_at).toLocaleDateString('pt-BR')}`, margin, yPos);
    yPos += 15; // Espaço após os detalhes

    // --- Descrição (Exercícios) ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Descrição dos Exercícios:', margin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    // Usar splitTextToSize para quebrar linhas longas
    const descriptionLines = doc.splitTextToSize(training.description, pageWidth - 2 * margin);
    descriptionLines.forEach((line: string) => {
      if (yPos + 7 > pageHeight - margin) { // Verifica quebra de página
        doc.addPage();
        yPos = margin; // Reinicia yPos na nova página
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Descrição dos Exercícios (continuação):', margin, yPos);
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
      }
      doc.text(line, margin, yPos);
      yPos += 7;
    });
    yPos += 15;

    // --- Alunos Associados ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    if (yPos + 20 > pageHeight - margin) { // Verifica quebra de página antes de listar alunos
      doc.addPage();
      yPos = margin;
    }
    doc.text('Alunos Associados:', margin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    if (training.members.length === 0) {
      doc.text('Nenhum aluno associado a este treino.', margin + 5, yPos);
      yPos += 7;
    } else {
      training.members.forEach(memberId => {
        const member = members.find(m => m.id === memberId);
        if (member) {
          if (yPos + 7 > pageHeight - margin) { // Verifica quebra de página para cada aluno
            doc.addPage();
            yPos = margin;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text('Alunos Associados (continuação):', margin, yPos);
            yPos += 8;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
          }
          doc.text(`- ${member.full_name}`, margin + 5, yPos);
          yPos += 7;
        }
      });
    }

    // Salva o PDF com um nome mais descritivo e único
    doc.save(`treino_${training.name.replace(/\s/g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
    toast({ title: 'PDF Gerado', description: `O PDF para o treino "${training.name}" foi gerado com sucesso!`, duration: 3000 });
  };


  return (
    <div className="max-w-4xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg flex flex-col gap-8 transition-colors">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 dark:text-white tracking-tight select-none mb-8">
        Cadastro de Treino
      </h1>

      {/* Seção de Campos Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Nome do Treino */}
        <div className="col-span-full"> {/* Ocupa a largura total em todas as telas */}
          <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-2">Nome do Treino</label>
          <input
            type="text"
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={saving}
          />
        </div>

        {/* Descrição */}
        <div className="col-span-full"> {/* Ocupa a largura total em todas as telas */}
          <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-2">Descrição</label>
          <textarea
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 resize-none bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={saving}
          />
        </div>

        {/* Duração */}
        <div>
          <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-2">Duração</label>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              className="w-20 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              placeholder="Horas"
              value={durationHours}
              onChange={e => setDurationHours(e.target.value)}
              disabled={saving}
            />
            <span className="self-center">h</span>
            <input
              type="number"
              min={0}
              max={59}
              className="w-20 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              placeholder="Minutos"
              value={durationMinutes}
              onChange={e => setDurationMinutes(e.target.value)}
              disabled={saving}
            />
            <span className="self-center">min</span>
          </div>
        </div>

        {/* Nível */}
        <div>
          <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-2">Nível</label>
          <select
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            value={level}
            onChange={e => setLevel(e.target.value as TrainingLevel)}
            disabled={saving}
          >
            <option value="">Selecione</option>
            <option value="iniciante">Iniciante</option>
            <option value="intermediario">Intermediário</option>
            <option value="avancado">Avançado</option>
          </select>
        </div>

        {/* Responsável */}
        <div>
          <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-2">Responsável</label>
          <input
            type="text"
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            value={responsible}
            onChange={e => setResponsible(e.target.value)}
            disabled={saving}
          />
        </div>

        {/* NOVO CAMPO: Categoria do Treino */}
        <div>
          <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-2">Categoria do Treino</label>
          <select
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            value={category}
            onChange={e => setCategory(e.target.value as TrainingCategory)}
            disabled={saving}
          >
            <option value="">Selecione a Categoria</option>
            <option value="membros_inferiores">Membros Inferiores</option>
            <option value="membros_sup_costas">Membros Sup. / Costas</option>
            <option value="membros_sup">Membros Superiores</option>
            <option value="antebraco">Antebraço</option>
          </select>
        </div>
      </div>

      {/* Seção de Seleção de Alunos */}
      <div className="mb-6">
        <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-2">Selecionar Aluno</label>
        <select
          className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
          value={selectedMember}
          onChange={e => setSelectedMember(e.target.value)}
          disabled={saving || loading}
        >
          <option value="">Selecione o aluno</option>
          {loading ? (
            <option disabled>Carregando alunos...</option>
          ) : members.length === 0 ? (
            <option disabled>Nenhum aluno encontrado</option>
          ) : (
            members.map(member => (
              <option key={member.id} value={member.id}>{member.full_name}</option>
            ))
          )}
        </select>
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <Button
          onClick={handleSubmit}
          disabled={saving || loading}
          className="px-10 py-3 text-xl font-semibold bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg shadow-md transition-colors duration-200"
        >
          {saving ? 'Salvando...' : 'Salvar Treino'}
        </Button>
        <Button
          variant="outline"
          onClick={() => setViewModal(true)}
          className="px-6 py-3 text-lg border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-lg shadow-sm transition-colors duration-200"
        >
          📋 Visualizar Treinos
        </Button>
      </div>

      {/* Modal automático após salvar */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 dark:bg-black/70 z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-xl w-full max-w-xl animate-fade-in transition-colors">
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">Treino Cadastrado com Sucesso!</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2"> {/* Adicionado pr-2 para scrollbar */}
              {modalData.map((data, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-zinc-800 hover:shadow-sm transition-shadow duration-200">
                  <p className="text-gray-800 dark:text-gray-200"><strong className="text-indigo-700 dark:text-indigo-400">Aluno:</strong> {data.studentName}</p>
                  <p className="text-gray-800 dark:text-gray-200"><strong className="text-indigo-700 dark:text-indigo-400">Treino:</strong> {data.trainingName}</p>
                  <p className="text-gray-800 dark:text-gray-200"><strong className="text-indigo-700 dark:text-indigo-400">Exercícios:</strong> {data.description}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 shadow-md transition-colors duration-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de visualização geral */}
      {viewModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 dark:bg-black/70 z-50 p-0">
          <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-2 sm:mx-4 animate-fade-in transition-colors">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2 sm:gap-4">
              <input
                type="text"
                placeholder="Filtrar por nome do associado..."
                className="border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 w-full sm:max-w-[200px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-colors"
                value={filterMemberName}
                onChange={e => setFilterMemberName(e.target.value)}
                autoFocus
              />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-right w-full sm:w-auto transition-colors">Todos os Treinos Cadastrados</h3>
            </div>
            {loading ? (
              <p className="text-center text-indigo-600 dark:text-indigo-400 font-semibold py-8">Carregando treinos...</p>
            ) : savedTrainings.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 italic py-8">Nenhum treino cadastrado ainda.</p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2"> {/* Aumentei a altura e adicionei pr-2 */}
                {savedTrainings.filter(training => {
                  if (!filterMemberName.trim()) return true;
                  // Verifica se algum associado do treino corresponde ao filtro
                  return training.members.some(memberId => {
                    const member = members.find(m => m.id === memberId);
                    return member && member.full_name.toLowerCase().includes(filterMemberName.toLowerCase());
                  });
                }).map((training, index) => (
                  <div key={training.id || index} className="border border-gray-200 dark:border-zinc-700 rounded-lg p-4 bg-gray-50 dark:bg-zinc-800 hover:shadow-md transition-shadow duration-200">
                    <p className="font-bold text-xl text-indigo-700 dark:text-indigo-400 mb-2">🏋️‍♂️ {training.name}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-200 mb-1"><strong className="text-gray-900 dark:text-gray-100">Categoria:</strong> {formatTextForDisplay(training.category)}</p> {/* EXIBINDO CATEGORIA */}
                    <p className="text-sm text-gray-700 dark:text-gray-200 mb-1"><strong className="text-gray-900 dark:text-gray-100">Descrição:</strong> {training.description}</p>
                    {/* Exibir duração em horas e minutos na listagem */}
                    <p className="text-sm text-gray-700 dark:text-gray-200 mb-1"><strong className="text-gray-900 dark:text-gray-100">Duração:</strong> {(() => {
                      const durationNum = Number(training.duration);
                      const h = Math.floor(durationNum / 60);
                      const m = durationNum % 60;
                      let durationStr = '';
                      if (h > 0) durationStr += `${h}h`;
                      if (m > 0) durationStr += (durationStr ? ' ' : '') + `${m}min`;
                      return durationStr || '0min';
                    })()}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-200 mb-1"><strong className="text-gray-900 dark:text-gray-100">Nível:</strong> {formatTextForDisplay(training.level)}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-200 mb-1"><strong className="text-gray-900 dark:text-gray-100">Responsável:</strong> {training.responsible}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-200 mb-2"><strong className="text-gray-900 dark:text-gray-100">Criado em:</strong> {new Date(training.created_at).toLocaleDateString('pt-BR')}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-200"><strong className="text-gray-900 dark:text-gray-100">Alunos:</strong></p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 ml-4 mb-3">
                      {training.members.length === 0 ? (
                        <li className="text-gray-500 dark:text-gray-400 italic">Nenhum aluno associado</li>
                      ) : (
                        training.members.map(memberId => {
                          const member = members.find(m => m.id === memberId);
                          return (
                            <li key={memberId}>
                              {member?.full_name || 'Aluno desconhecido'}
                            </li>
                          );
                        })
                      )}
                    </ul>
                    <div className="flex justify-end mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportPdf(training)}
                        className="border-green-500 text-green-600 dark:border-green-400 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 hover:text-green-700 dark:hover:text-green-300 transition-colors duration-200"
                      >
                        ⬇️ Exportar PDF
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewModal(false)}
                className="px-6 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 shadow-md transition-colors duration-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CadastroTreino;