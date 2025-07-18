import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import { DateSelectArg, EventClickArg, EventDropArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { supabase, AgendaEvent } from '@/lib/supabase';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

interface EventData {
  id?: number | string;
  title: string;
  date: string;
  time: string;
  responsible: string;
  status?: 'active' | 'denied' | 'pending';
  created_at?: string;
}

const emptyEvent: EventData = {
  id: undefined,
  title: '',
  date: '',
  time: '',
  responsible: '',
  status: 'active',
};

const AgendaAdm: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [eventData, setEventData] = useState<EventData>(emptyEvent);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'denied'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Coloca foco no input do título quando modal abrir
  useEffect(() => {
    if (modalOpen && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [modalOpen]);

  // Toast desaparece após 4s automaticamente
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  async function fetchEvents() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('agenda').select('*');
      if (error) throw error;

      if (data) {
        const formatted = data.map((event: any) => ({
          id: event.id?.toString(),
          title: event.title,
          start: `${event.date}T${event.time}`,
          extendedProps: { ...event },
          classNames: event.status === 'denied' ? ['denied'] : ['active'],
        }));
        setEvents(formatted);
      }
    } catch (error: any) {
      console.error('Erro ao buscar eventos:', error.message);
      setToastMessage('Erro ao buscar eventos.');
    } finally {
      setLoading(false);
    }
  }

  const formatTime = (time: string) => {
    const [h, m] = time.split(':');
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
  };

  function handleDateSelect(selectInfo: DateSelectArg) {
    const selectedDate = selectInfo.startStr.split('T')[0];
    setEventData({ ...emptyEvent, date: selectedDate });
    setModalOpen(true);
  }

  function handleEventClick(clickInfo: EventClickArg) {
    const event = clickInfo.event;
    const props = event.extendedProps as EventData;

    setEventData({
      id: props.id,
      title: props.title,
      date: event.startStr.split('T')[0],
      time: formatTime(event.startStr.split('T')[1]?.substring(0, 5) || ''),
      responsible: props.responsible,
      status: props.status || 'active',
    });

    setModalOpen(true);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: value }));
  }

  function hasConflict(date: string, time: string, idToExclude?: number | string) {
    return events.some(ev => {
      const evProps = ev.extendedProps as EventData;
      if (idToExclude && evProps.id?.toString() === idToExclude.toString()) return false;
      return evProps.date === date && evProps.time === time && evProps.status !== 'denied';
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { id, title, date, time, responsible, status } = eventData;

    if (!title || !date || !time || !responsible) {
      setToastMessage('Preencha todos os campos.');
      return;
    }

    if (hasConflict(date, time, id)) {
      setToastMessage('Já existe um evento ativo marcado para essa data e horário.');
      return;
    }

    try {
      setLoading(true);
      if (id) {
        const { error } = await supabase
          .from('agenda')
          .update({ title, date, time, responsible, status })
          .eq('id', Number(id));
        if (error) throw error;
        setToastMessage('Evento atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('agenda')
          .insert([{ title, date, time, responsible, status }]);
        if (error) throw error;
        setToastMessage('Evento criado com sucesso!');
      }
      await fetchEvents();
      setModalOpen(false);
      setEventData(emptyEvent);
    } catch (error: any) {
      setToastMessage('Erro ao salvar evento: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!eventData.id) return;
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;

    try {
      setLoading(true);
      const { error } = await supabase.from('agenda').delete().eq('id', Number(eventData.id));
      if (error) throw error;
      setToastMessage('Evento excluído.');
      await fetchEvents();
      setModalOpen(false);
      setEventData(emptyEvent);
    } catch (error: any) {
      setToastMessage('Erro ao excluir evento: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeny() {
    if (!eventData.id) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('agenda')
        .update({ status: 'denied' } as AgendaEvent)
        .eq('id', Number(eventData.id));
      if (error) throw error;
      setToastMessage('Evento negado.');
      await fetchEvents();
      setModalOpen(false);
      setEventData(emptyEvent);
    } catch (error: any) {
      setToastMessage('Erro ao negar evento: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleEventDrop(info: EventDropArg) {
    const event = info.event;
    const id = event.extendedProps.id;
    const date = event.startStr.split('T')[0];
    const timeRaw = event.startStr.split('T')[1]?.substring(0, 5) || '';
    const time = formatTime(timeRaw);

    if (hasConflict(date, time, id)) {
      setToastMessage('Já existe um evento ativo marcado para essa data e horário.');
      info.revert();
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('agenda')
        .update({ date, time })
        .eq('id', Number(id));
      if (error) throw error;
      setToastMessage('Evento atualizado.');
      await fetchEvents();
    } catch (error: any) {
      setToastMessage('Erro ao atualizar evento: ' + error.message);
      info.revert();
    } finally {
      setLoading(false);
    }
  }

  function renderEventContent(eventInfo: { event: EventInput & { extendedProps: EventData } }) {
    const { title, extendedProps } = eventInfo.event;
    return (
      <Tippy
        content={
          <div className="text-sm">
            <div><strong>Responsável:</strong> {extendedProps.responsible}</div>
            <div><strong>Status:</strong> {extendedProps.status === 'denied' ? 'Negado' : 'Ativo'}</div>
            <div><strong>Hora:</strong> {extendedProps.time}</div>
          </div>
        }
        placement="top"
        delay={200}
      >
        <div>{title}</div>
      </Tippy>
    );
  }

  const filteredEvents = events.filter(ev => {
    const evProps = ev.extendedProps as EventData;
    const matchesStatus = filterStatus === 'all' || ev.classNames?.includes(filterStatus);
    const matchesSearch =
      evProps.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evProps.responsible.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <h1
        className="text-3xl font-bold mb-6 text-center text-primary"
        style={{ color: 'hsl(var(--primary))' }}
      >
        Agenda da Academia
      </h1>

      <div className="mb-6 flex flex-wrap justify-center items-center gap-4">
        <label
          htmlFor="filterStatus"
          className="font-semibold text-primary dark:text-indigo-400"
        >
          Filtrar por status:
        </label>
        <select
          id="filterStatus"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as 'all' | 'active' | 'denied')}
          className="border border-gray-300 dark:border-gray-700 rounded px-3 py-1 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white transition-colors"
        >
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="denied">Negados</option>
        </select>

        <input
          type="search"
          placeholder="Buscar título ou responsável"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 rounded px-3 py-1 w-64 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
          aria-label="Buscar eventos por título ou responsável"
        />
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={ptBrLocale}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        editable={!loading}
        selectable={!loading}
        selectMirror={true}
        dayMaxEvents={true}
        select={handleDateSelect}
        events={filteredEvents}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventContent={renderEventContent}
        height="auto"
        eventClassNames={(arg) =>
          arg.event.extendedProps.status === 'denied' ? ['denied-event'] : ['active-event']
        }
      />

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 dark:bg-black/70 flex justify-center items-center z-50"
          onClick={() => setModalOpen(false)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded p-6 w-96 max-w-full text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 transition-colors"
            onClick={e => e.stopPropagation()}
            role="document"
          >
            <h2 className="text-xl font-semibold mb-4">
              {eventData.id ? 'Editar Evento' : 'Criar Evento'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block font-semibold mb-1">
                  Título:
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  ref={firstInputRef}
                  value={eventData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="date" className="block font-semibold mb-1">
                  Data:
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={eventData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="time" className="block font-semibold mb-1">
                  Hora:
                </label>
                <input
                  id="time"
                  name="time"
                  type="time"
                  value={eventData.time}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="responsible" className="block font-semibold mb-1">
                  Responsável:
                </label>
                <input
                  id="responsible"
                  name="responsible"
                  type="text"
                  value={eventData.responsible}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="status" className="block font-semibold mb-1">
                  Status:
                </label>
                <select
                  id="status"
                  name="status"
                  value={eventData.status}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white transition-colors"
                >
                  <option value="active">Ativo</option>
                  <option value="denied">Negado</option>
                </select>
              </div>

              <div className="flex justify-between mt-6">
                {eventData.id && (
                  <>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={loading}
                      className="bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
                    >
                      Excluir
                    </button>
                    <button
                      type="button"
                      onClick={handleDeny}
                      disabled={loading}
                      className="bg-yellow-500 dark:bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-600 dark:hover:bg-yellow-700 transition-colors"
                    >
                      Negar
                    </button>
                  </>
                )}

                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    disabled={loading}
                    className="bg-gray-300 dark:bg-zinc-700 text-gray-900 dark:text-white px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 dark:bg-indigo-700 px-4 py-2 rounded text-white hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors"
                  >
                    {loading ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastMessage && (
        <div
          role="alert"
          className="fixed bottom-6 right-6 bg-indigo-600 dark:bg-indigo-700 text-white px-4 py-3 rounded shadow-lg transition-colors"
        >
          {toastMessage}
        </div>
      )}

      <style>{`
        .denied-event {
          background-color: #f87171 !important; /* vermelho claro */
          border-color: #b91c1c !important; /* vermelho escuro */
          color: white !important;
        }
        .active-event {
          background-color: #34d399 !important; /* verde claro */
          border-color: #065f46 !important; /* verde escuro */
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default AgendaAdm;
