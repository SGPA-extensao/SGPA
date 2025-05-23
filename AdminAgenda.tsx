import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';       // visualização mensal
import timeGridPlugin from '@fullcalendar/timegrid';     // visualização semanal/dia
import interactionPlugin from '@fullcalendar/interaction'; // permite seleção e clique
import ptBrLocale from '@fullcalendar/core/locales/pt-br'; // idioma pt-br

const AgendaAdm = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [eventData, setEventData] = useState({
    title: '',
    date: '',
    time: '',
    responsible: '',
  });

  // Quando o usuário seleciona uma data no calendário
  const handleDateSelect = (selectInfo: any) => {
    setSelectedDate(selectInfo.startStr);
    setEventData({ ...eventData, date: selectInfo.startStr });
    setModalOpen(true);
  };

  // Atualiza o estado do formulário conforme usuário digita
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  // Submete o evento (aqui só fecha o modal e mostra alerta)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Evento criado:
Título: ${eventData.title}
Data: ${eventData.date}
Horário: ${eventData.time}
Responsável: ${eventData.responsible}`);
    setModalOpen(false);
    setEventData({ title: '', date: '', time: '', responsible: '' });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Agenda do Administrador</h1>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        selectable={true}
        select={handleDateSelect}
        locale={ptBrLocale}  // Define idioma pt-BR
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        buttonText={{
          today: 'Hoje',
          month: 'Mês',
          week: 'Semana',
          day: 'Dia'
        }}
        height="auto"
      />

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Novo Evento</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block font-medium mb-1">
                  Título
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={eventData.title}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="date" className="block font-medium mb-1">
                  Data
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  required
                  value={eventData.date}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="time" className="block font-medium mb-1">
                  Horário
                </label>
                <input
                  id="time"
                  name="time"
                  type="time"
                  required
                  value={eventData.time}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="responsible" className="block font-medium mb-1">
                  Responsável
                </label>
                <input
                  id="responsible"
                  name="responsible"
                  type="text"
                  required
                  value={eventData.responsible}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaAdm;
