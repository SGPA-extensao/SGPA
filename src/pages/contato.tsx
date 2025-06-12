import { useState } from "react";

const WHATSAPP_NUMBER = "5511999999999"; // Ajuste para seu número WhatsApp

export default function ContactUs() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    mensagem: "",
  });

  // Função para formatar telefone no padrão (65) 99999-9999
  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 0) return "";
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 11)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
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
    <div className="min-h-screen bg-black text-white pt-24 px-6 flex justify-center relative">
      <div className="max-w-xl w-full">
        <h1 className="text-4xl font-bold mb-6 text-blue-500">Contato</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nome" className="block mb-1 font-semibold">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              className="w-full rounded-md px-3 py-2 text-black"
              placeholder="Seu nome completo"
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block mb-1 font-semibold">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-md px-3 py-2 text-black"
              placeholder="seu@email.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="telefone" className="block mb-1 font-semibold">
              Telefone
            </label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              className="w-full rounded-md px-3 py-2 text-black"
              placeholder="(65) 99999-9999"
              autoComplete="tel"
              maxLength={15}
            />
          </div>

          <div>
            <label htmlFor="mensagem" className="block mb-1 font-semibold">
              Mensagem <span className="text-red-500">*</span>
            </label>
            <textarea
              id="mensagem"
              name="mensagem"
              rows={5}
              value={formData.mensagem}
              onChange={handleChange}
              required
              className="w-full rounded-md px-3 py-2 text-black resize-y"
              placeholder="Escreva sua mensagem aqui"
            />
          </div>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md transition"
          >
            Enviar via WhatsApp
          </button>
        </form>
      </div>
    </div>
  );
}
