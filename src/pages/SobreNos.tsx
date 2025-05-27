import { Card, CardContent } from "@/components/ui/card";
import {
  Info,
  Target,
  User,
  CalendarDays,
  Link as LinkIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Título e botão voltar */}
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-8 h-8 text-blue-500" />
            <h1 className="text-4xl font-bold">Sobre Nós</h1>
          </div>
        </div>

        {/* ... restante do conteúdo permanece igual ... */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-lg leading-relaxed">
              Este projeto é uma iniciativa acadêmica desenvolvida para a disciplina de Extensão 1, com o objetivo de criar um site funcional para uma academia.
            </p>
            <p className="text-lg leading-relaxed">
              Nosso foco é proporcionar uma experiência digital moderna e intuitiva, que facilite o acesso às informações e aos serviços da academia, promovendo a saúde e o bem-estar da comunidade.
            </p>
          </CardContent>
        </Card>

        {/* Objetivos */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-6 h-6 text-green-500" />
            <h2 className="text-2xl font-semibold">Objetivos</h2>
          </div>
          <ul className="list-disc pl-6 text-lg space-y-1">
            <li>Desenvolver um site responsivo e acessível para a academia</li>
            <li>Facilitar a comunicação entre a academia e seus usuários</li>
            <li>Oferecer funcionalidades como agendamento, login e acesso a conteúdos exclusivos</li>
            <li>Aplicar conhecimentos adquiridos na disciplina de Extensão 1</li>
          </ul>
        </div>

        {/* Responsáveis */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <User className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-semibold">Responsáveis</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { nome: "Beatriz", funcao: "Desenvolvedora Frontend" },
              { nome: "Caroline", funcao: "Designer UI/UX" },
              { nome: "Gabriel",  funcao: "Backend e Banco de Dados" },
              { nome: "Leandro",  funcao: "Gerente de Projeto" },
            ].map((pessoa, i) => (
              <Card key={i}>
                <CardContent className="p-4 text-center">
                  <p className="font-bold">{pessoa.nome}</p>
                  <p className="text-sm text-muted-foreground">{pessoa.funcao}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Linha do Tempo */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold">Linha do Tempo</h2>
          </div>
          <ul className="space-y-2 text-lg pl-4 border-l-2 border-gray-300 ml-2">
            <li><span className="font-medium">Março 2025:</span> Início do projeto e definição dos requisitos</li>
            <li><span className="font-medium">Abril 2025:</span> Desenvolvimento do layout e das funcionalidades</li>
            <li><span className="font-medium">Maio 2025:</span> Testes com usuários e ajustes finais</li>
            <li><span className="font-medium">Junho 2025:</span> Apresentação e entrega do projeto</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
