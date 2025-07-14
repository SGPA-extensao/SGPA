import { Card, CardContent } from "@/components/ui/card";
import {
  Info,
  Target,
  User,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Banner com imagem de capa */}
      <div className="relative w-full h-64 overflow-hidden">
        <img
          src="https://plus.unsplash.com/premium_photo-1670505062582-fdaa83c23c9e?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" // Troque pela imagem que quiser
          alt="Capa"
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl text-white font-bold drop-shadow-lg">
            Sobre Nós
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
        {/* Descrição com animação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-md rounded-2xl">
            <CardContent className="p-6 space-y-4 text-lg leading-relaxed">
              <p>
                Este projeto é uma iniciativa acadêmica desenvolvida para a disciplina de <strong>Extensão 1</strong>, com o objetivo de criar um site funcional para uma academia.
              </p>
              <p>
                Nosso foco é proporcionar uma experiência digital moderna e intuitiva, que facilite o acesso às informações e aos serviços da academia, promovendo a saúde e o bem-estar da comunidade.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Objetivos */}
        <motion.section
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-6 h-6 text-emerald-600" />
            <h2 className="text-2xl font-semibold">Objetivos</h2>
          </div>
          <ul className="list-disc pl-6 text-lg space-y-1 text-gray-700">
            <li>Desenvolver um site responsivo e acessível para a academia</li>
            <li>Facilitar a comunicação entre a academia e seus usuários</li>
            <li>Oferecer funcionalidades como agendamento, login e acesso a conteúdos exclusivos</li>
            <li>Aplicar conhecimentos adquiridos na disciplina de Extensão 1</li>
          </ul>
        </motion.section>

        {/* Responsáveis */}
        <motion.section
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <User className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-semibold">Responsáveis</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { nome: "Beatriz", funcao: "Desenvolvedora Frontend" },
              { nome: "Caroline", funcao: "Designer UI/UX" },
              { nome: "Gabriel", funcao: "Backend e Banco de Dados" },
              { nome: "Leandro", funcao: "Gerente de Projeto" },
            ].map((pessoa, i) => (
              <Card key={i} className="shadow-sm rounded-xl">
                <CardContent className="p-4 text-center">
                  <p className="font-bold text-gray-800">{pessoa.nome}</p>
                  <p className="text-sm text-gray-500">{pessoa.funcao}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Linha do Tempo */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-6 h-6 text-orange-600" />
            <h2 className="text-2xl font-semibold">Linha do Tempo</h2>
          </div>
          <ul className="space-y-3 text-lg pl-4 border-l-4 border-orange-300 ml-2 text-gray-700">
            <li>
              <span className="font-medium">Março 2025:</span> Início do projeto e definição dos requisitos
            </li>
            <li>
              <span className="font-medium">Abril 2025:</span> Desenvolvimento do layout e das funcionalidades
            </li>
            <li>
              <span className="font-medium">Maio 2025:</span> Testes com usuários e ajustes finais
            </li>
            <li>
              <span className="font-medium">Junho 2025:</span> Apresentação e entrega do projeto
            </li>
          </ul>
        </motion.section>

        {/* Botão Voltar ao Início */}
        <motion.div
          className="flex justify-center pt-10"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-md"
          >
            <ArrowUpRight className="w-5 h-5" />
            Voltar ao Início
          </button>
        </motion.div>
      </div>
    </div>
  );
}
