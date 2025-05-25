import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import { DateSelectArg, EventClickArg, EventDropArg, EventResizeDoneArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { supabase } from '@/lib/supabase';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

type EventData = {
  id?: number;
  title: string;
  date: string;
  time: string;
  responsible: string;
  status?: 'active' | 'denied';
};

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
  const [events, setEvents] = useState<
    { id?: number; title: string; start: string; extendedProps?: EventData; classNames?: string[] }[]
  >([]);
  const [eventData, setEventData] = useState<EventData>(emptyEvent);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'denied'>('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  // Buscar eventos
  const fetchEvents = async () => {
    const { data, error } = await supabase.from('agenda').select('*');
    if (error) {
      console.error('Erro ao buscar eventos:', error.message);
      return;
    }

    if (data) {
      const formatted = data.map(event => ({
        id: event.id,
        title: event.title,
        start: `${event.date}T${event.time}`,
        extendedProps: { ...event },
        classNames: event.status === 'denied' ? ['denied'] : ['active'],
      }));
      setEvents(formatted);
    }
  };

  // Seleção de data para novo evento
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const selectedDate = selectInfo.startStr.split('T')[0];
    setEventData({ ...emptyEvent, date: selectedDate });
    setModalOpen(true);
  };

  // Clique em evento para editar
  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const props = event.extendedProps as EventData;

    setEventData({
      id: props.id,
      title: props.title,
      date: event.startStr.split('T')[0],
      time: event.startStr.split('T')[1]?.substring(0, 8) || '',
      responsible: props.responsible,
      status: props.status || 'active',
    });

    setModalOpen(true);
  };

  // Input do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: value }));
  };

  // Salvar evento
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { id, title, date, time, responsible, status } = eventData;

    if (!title || !date || !time || !responsible) {
      alert('Preencha todos os campos.');
      return;
    }

    if (id) {
      const { error } = await supabase
        .from('agenda')
        .update({ title, date, time, responsible, status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        alert('Erro ao atualizar evento: ' + error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from('agenda')
        .insert([{ title, date, time, responsible, status }])
        .select()
        .single();

      if (error) {
        alert('Erro ao criar evento: ' + error.message);
        return;
      }
    }

    await fetchEvents();
    setModalOpen(false);
    setEventData(emptyEvent);
  };

  // Excluir evento
  const handleDelete = async () => {
    if (!eventData.id) return;

    if (!confirm('Tem certeza que deseja excluir este evento?')) return;

    const { error } = await supabase.from('agenda').delete().eq('id', eventData.id);

    if (error) {
      alert('Erro ao excluir evento: ' + error.message);
      return;
    }

    await fetchEvents();
    setModalOpen(false);
    setEventData(emptyEvent);
  };

  // Negar evento
  const handleDeny = async () => {
    if (!eventData.id) return;

    const { error } = await supabase
      .from('agenda')
      .update({ status: 'denied' })
      .eq('id', eventData.id);

    if (error) {
      alert('Erro ao negar evento: ' + error.message);
      return;
    }

    await fetchEvents();
    setModalOpen(false);
    setEventData(emptyEvent);
  };

  // Eventos arrastados/redimensionados
  const handleEventDrop = async (info: EventDropArg) => {
    const event = info.event;
    const id = event.extendedProps.id;
    const date = event.startStr.split('T')[0];
    const time = event.startStr.split('T')[1]?.substring(0, 8) || '';

    const { error } = await supabase
      .from('agenda')
      .update({ date, time })
      .eq('id', id);

    if (error) {
      alert('Erro ao atualizar evento: ' + error.message);
      info.revert();
    } else {
      fetchEvents();
    }
  };

  const handleEventResize = async (info: EventResizeDoneArg) => {
    // Caso queira controlar o resize (exemplo: ajustar duração)
    // Aqui, apenas atualiza o start, mesma lógica do drop
    await handleEventDrop(info as unknown as EventDropArg);
  };

  // Renderização do conteúdo do evento com tooltip
  const renderEventContent = (eventInfo) => {
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
  };

  // Filtrar eventos conforme status
  const filteredEvents = events.filter(ev => filterStatus === 'all' || ev.classNames?.includes(filterStatus));

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center">Agenda do Administrador</h1>

      {/* Filtro simples */}
      <div className="mb-4 flex items-center justify-center space-x-4">
        <label htmlFor="filterStatus" className="font-medium">
          Filtrar por status:
        </label>
        <select
          id="filterStatus"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as 'all' | 'active' | 'denied')}
          className="border px-3 py-1 rounded"
        >
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="denied">Negados</option>
        </select>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        selectable
        select={handleDateSelect}
        events={filteredEvents}
        eventClick={handleEventClick}
        locale={ptBrLocale}
        headerToolbar={{
          left: 'prevYear,prev,next,nextYear today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        buttonText={{
          today: 'Hoje',
          month: 'Mês',
          week: 'Semana',
          day: 'Dia',
        }}
        height="auto"
        editable={true}
        eventResizableFromStart={true}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        eventContent={renderEventContent}
        eventClassNames={(arg) => arg.event.extendedProps.status === 'denied' ? ['denied'] : ['active']}
      />

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-md shadow-md max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">
              {eventData.id ? 'Editar Evento' : 'Novo Evento'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium" htmlFor="title">
                  Título
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={eventData.title}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded focus:outline-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium" htmlFor="date">
                  Data
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={eventData.date}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded focus:outline-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium" htmlFor="time">
                  Hora
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={eventData.time}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded focus:outline-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium" htmlFor="responsible">
                  Responsável
                </label>
                <input
                  type="text"
                  id="responsible"
                  name="responsible"
                  value={eventData.responsible}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded focus:outline-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={eventData.status}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded focus:outline-blue-500"
                >
                  <option value="active">Ativo</option>
                  <option value="denied">Negado</option>
                </select>
              </div>

              <div className="flex justify-between pt-4">
                <div className="space-x-2">
                  {eventData.id && (
                    <>
                      <button
                        type="button"
                        onClick={handleDeny}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                      >
                        Negar
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                      >
                        Excluir
                      </button>
                    </>
                  )}
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false);
                      setEventData(emptyEvent);
                    }}
                    className="mr-3 px-4 py-2 rounded border border-gray-400 hover:bg-gray-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Estilos para os eventos */
        .fc .active {
          background-color: #2563eb !important;
          border-color: #1e40af !important;
          color: white !important;
          font-weight: 600;
          border-radius: 0.375rem;
          box-shadow: 0 1px 3px rgb(0 0 0 / 0.2);
        }

        .fc .denied {
          background-color: #ef4444 !important;
          border-color: #b91c1c !important;
          color: white !important;
          font-weight: 600;
          border-radius: 0.375rem;
        }

        /* Botões */
        .fc-button {
          border-radius: 0.375rem;
          border: none;
          padding: 0.5rem 1rem;
          font-weight: 600;
          box-shadow: 0 2px 4px rgb(0 0 0 / 0.1);
          transition: background-color 0.2s ease;
          background-color: #2563eb;
          color: white;
        }

        .fc-button:hover {
          background-color: #1e40af;
          cursor: pointer;
        }

        .fc .fc-toolbar-title {
          font-weight: 700;
          font-size: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default AgendaAdm;
