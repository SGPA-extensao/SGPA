import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const Configuracoes = () => {
    // Estado para modo escuro
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('darkMode') === 'true' ||
                (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('darkMode', darkMode.toString());
    }, [darkMode]);
    const { toast } = useToast();

    const [academyName, setAcademyName] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [address, setAddress] = useState('');
    const [openingHours, setOpeningHours] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // useEffect para buscar configurações pode ser implementado aqui

    // Função de submit (placeholder)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // lógica de salvar configurações
        toast({ title: 'Configurações salvas!' });
    };

    // Função de voltar (placeholder)
    const handleBack = () => {
        window.history.back();
    };

    return (
        <div className="max-w-3xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg flex flex-col gap-8 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight select-none">
                    Configurações
                </h1>
                <button
                    aria-label="Alternar modo claro/escuro"
                    title="Alternar modo claro/escuro"
                    onClick={() => setDarkMode(!darkMode)}
                    className="ml-2 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    {darkMode ? (
                        <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zM15.657 4.343a1 1 0 011.414 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707zM18 10a1 1 0 011 1h-1a1 1 0 110-2h1a1 1 0 01-1 1zM15.657 15.657a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM10 18a1 1 0 11-2 0v-1a1 1 0 112 0v1zM4.343 15.657a1 1 0 11-1.414-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707zM2 10a1 1 0 110-2h1a1 1 0 110 2H2zM4.343 4.343a1 1 0 011.414-1.414l.707.707A1 1 0 115.05 5.05l-.707-.707z" />
                            <circle cx="10" cy="10" r="3" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.293 13.293A8 8 0 116.707 2.707a7 7 0 0010.586 10.586z" />
                        </svg>
                    )}
                </button>
            </div>
            <form className="space-y-8" onSubmit={handleSubmit}>
                <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-2">Nome da Academia</label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        value={academyName}
                        onChange={e => setAcademyName(e.target.value)}
                        disabled={isLoading}
                        placeholder="Ex: FitPro Academia"
                    />
                </div>
                <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-2">WhatsApp</label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        value={whatsappNumber}
                        onChange={e => setWhatsappNumber(e.target.value)}
                        disabled={isLoading}
                        placeholder="Ex: (11) 91234-5678"
                    />
                </div>
                <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-2">Email de Contato</label>
                    <input
                        type="email"
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        value={contactEmail}
                        onChange={e => setContactEmail(e.target.value)}
                        disabled={isLoading}
                        placeholder="Ex: contato@academia.com"
                    />
                </div>
                <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-2">Endereço</label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        disabled={isLoading}
                        placeholder="Ex: Rua Exemplo, 123, Centro"
                    />
                </div>
                <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-2">Horário de Funcionamento</label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        value={openingHours}
                        onChange={e => setOpeningHours(e.target.value)}
                        disabled={isLoading}
                        placeholder="Ex: Seg-Sex: 6h às 22h, Sáb: 8h às 14h"
                    />
                </div>
                <div className="flex space-x-2">
                    <Button type="button" variant="secondary" onClick={handleBack}>
                        Voltar
                    </Button>
                    <Button type="submit" disabled={isLoading} className="bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg shadow-md transition-colors duration-200">
                        {isLoading ? 'Salvando...' : 'Salvar Configurações'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default Configuracoes;
