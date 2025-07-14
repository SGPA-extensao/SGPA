import { useState } from "react";
import { motion } from "framer-motion"; // Import motion
import { Phone, Mail, MapPin, Send } from "lucide-react"; // Import new icons

const WHATSAPP_NUMBER = "5565999999999"; // Ajuste para seu número WhatsApp em Cuiabá

export default function ContactUs() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    mensagem: "",
  });

  // Função para formatar telefone no padrão (DD) 9XXXX-XXXX
  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 0) return "";
    // Format for (DD)
    if (digits.length <= 2) return `(${digits}`;
    // Format for (DD) XXXXX
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    // Format for (DD) XXXXX-XXXX
    if (digits.length <= 11)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    // Limit to 11 digits for standard Brazilian mobile numbers
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    if (name === "telefone") {
      const formattedPhone = formatPhone(value);
      setFormData({ ...formData, telefone: formattedPhone });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.nome || !formData.email || !formData.mensagem) {
      alert("Por favor, preencha os campos Nome, Email e Mensagem.");
      return;
    }

    const message = `Olá! Gostaria de entrar em contato com a academia.\n\nNome: ${formData.nome}\nEmail: ${formData.email}\nTelefone: ${formData.telefone || '-'}\nMensagem: ${formData.mensagem}`;
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(url, "_blank");
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Banner com imagem de capa */}
      <div className="relative w-full h-64 overflow-hidden">
        <img
          src="https://images.pexels.com/photos/949126/pexels-photo-949126.jpeg" // Imagem de contato ou equipe
          alt="Contato"
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl text-white font-bold drop-shadow-lg">
            Entre em Contato
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
        {/* Descrição e introdução ao contato */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold mb-3">Fale Conosco!</h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Tem alguma dúvida, sugestão ou quer saber mais sobre nossos planos?
              Envie-nos uma mensagem ou utilize os outros canais de contato.
              Estamos prontos para te atender!
            </p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Formulário de Contato */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white p-8 rounded-xl shadow-lg"
          >
            <h3 className="text-2xl font-semibold mb-6 text-blue-600">Envie uma Mensagem</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="nome" className="block mb-1 font-semibold text-gray-700">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md px-4 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Seu nome completo"
                  autoComplete="name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block mb-1 font-semibold text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md px-4 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="seu@email.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="telefone" className="block mb-1 font-semibold text-gray-700">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="w-full rounded-md px-4 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="(65) 99999-9999"
                  autoComplete="tel"
                  maxLength={15}
                />
              </div>

              <div>
                <label htmlFor="mensagem" className="block mb-1 font-semibold text-gray-700">
                  Mensagem <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="mensagem"
                  name="mensagem"
                  rows={5}
                  value={formData.mensagem}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md px-4 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition resize-y"
                  placeholder="Escreva sua mensagem aqui"
                />
              </div>

              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-semibold flex items-center justify-center gap-2 shadow-md transition w-full"
              >
                <Send className="w-5 h-5" />
                Enviar via WhatsApp
              </button>
            </form>
          </motion.div>

          {/* Informações de Contato */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white p-8 rounded-xl shadow-lg space-y-6 flex flex-col justify-center"
          >
            <h3 className="text-2xl font-semibold mb-4 text-purple-600">Outras Formas de Contato</h3>
            <div className="flex items-center gap-4 text-lg">
              <Phone className="w-7 h-7 text-green-500" />
              <div>
                <p className="font-semibold">Telefone/WhatsApp:</p>
                <a href={`tel:${WHATSAPP_NUMBER}`} className="text-gray-700 hover:underline">
                  (65) 99999-9999
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4 text-lg">
              <Mail className="w-7 h-7 text-red-500" />
              <div>
                <p className="font-semibold">Email:</p>
                <a href="mailto:contato@academia.com.br" className="text-gray-700 hover:underline">
                  contato@academia.com.br
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4 text-lg">
              <MapPin className="w-7 h-7 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold">Endereço:</p>
                <p className="text-gray-700">
                  Rua Exemplo, 123, Bairro Centro, Cuiabá - MT, CEP: 78000-000
                </p>
              </div>
            </div>
            {/* Mapa (placeholder) */}
            <div className="mt-6">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3840.404284813088!2d-56.09631742468352!3d-15.602334884784405!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x939da30581423c7f%3A0x6b4c1d4a8d4a9f9!2sCuiab%C3%A1%2C%20MT!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg shadow-md"
              ></iframe>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}