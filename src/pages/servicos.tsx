import { Card, CardContent } from "@/components/ui/card";
import { Wrench, Dumbbell, CalendarCheck, Users, HeartPulse, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Import useNavigate

export default function Servicos() {
    const navigate = useNavigate(); // Initialize useNavigate

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            {/* Banner com imagem de capa */}
            <div className="relative w-full h-64 overflow-hidden">
                <img
                    src="https://images.pexels.com/photos/28080/pexels-photo.jpg" // Substitua por uma imagem de serviços de academia
                    alt="Serviços"
                    className="w-full h-full object-cover brightness-75"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <h1 className="text-4xl md:text-5xl text-white font-bold drop-shadow-lg">
                        Nossos Serviços
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
                                Descubra a gama completa de serviços que a nossa academia oferece, pensados para atender às suas necessidades de <strong>saúde</strong> e <strong>bem-estar</strong>. Com uma infraestrutura moderna e profissionais qualificados, estamos aqui para te ajudar a alcançar seus objetivos.
                            </p>
                            <p>
                                De treinos personalizados a aulas coletivas dinâmicas, nossa missão é proporcionar uma experiência completa e motivadora para todos os nossos membros.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Seção de Serviços Principais */}
                <motion.section
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Dumbbell className="w-6 h-6 text-emerald-600" />
                        <h2 className="text-2xl font-semibold">Modalidades e Treinos</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: <Dumbbell className="w-10 h-10 text-red-500" />,
                                title: "Musculação",
                                desc: "Aparelhos modernos e acompanhamento profissional para sua evolução.",
                            },
                            {
                                icon: <Users className="w-10 h-10 text-purple-500" />,
                                title: "Aulas em Grupo",
                                desc: "Energia e diversão com diversas aulas, como Yoga, Zumba e Spinning.",
                            },
                            {
                                icon: <HeartPulse className="w-10 h-10 text-orange-500" />,
                                title: "Avaliação Física",
                                desc: "Um plano de treino personalizado baseado em suas metas e condição física.",
                            },
                        ].map((servico, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: i * 0.2 }}
                            >
                                <Card className="rounded-xl shadow-md h-full">
                                    <CardContent className="p-6 space-y-3 text-center">
                                        <div className="flex justify-center">{servico.icon}</div>
                                        <h3 className="text-xl font-semibold">{servico.title}</h3>
                                        <p className="text-gray-600">{servico.desc}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Seção de Conforto e Conveniência */}
                <motion.section
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <CalendarCheck className="w-6 h-6 text-blue-600" />
                        <h2 className="text-2xl font-semibold">Conveniência e Suporte</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            {
                                icon: <CalendarCheck className="w-10 h-10 text-blue-500" />,
                                title: "Agendamento Online",
                                desc: "Agende suas aulas e treinos de forma prática e rápida pelo nosso site.",
                            },
                            {
                                icon: <Wrench className="w-10 h-10 text-green-500" />,
                                title: "Manutenção de Equipamentos",
                                desc: "Garantimos sua segurança com equipamentos revisados e em perfeito estado.",
                            },
                        ].map((servico, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: i * 0.2 }}
                            >
                                <Card className="rounded-xl shadow-md h-full">
                                    <CardContent className="p-6 space-y-3 text-center">
                                        <div className="flex justify-center">{servico.icon}</div>
                                        <h3 className="text-xl font-semibold">{servico.title}</h3>
                                        <p className="text-gray-600">{servico.desc}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Botão para Agendamento ou Contato */}
                <motion.div
                    className="flex justify-center pt-10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <button
                        onClick={() => navigate("/Login")}
                        className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-md"
                    >
                        <ArrowUpRight className="w-5 h-5" />
                        Tela Inicial
                    </button>
                </motion.div>
            </div>
        </div>
    );
}