import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import LayoutLog from "@/components/LayoutLog";

import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ResetPassword from "@/pages/ResetPassword";
import ResetPasswordRequest from "@/pages/ResetPasswordRequest";
import Dashboard from "@/pages/adm/Dashboard";
import Members from "@/pages/adm/Members";
import MemberForm from "@/pages/adm/MemberForm";
import MemberProfile from "@/pages/adm/MemberProfile";
import NotFound from "@/pages/NotFound";
import Frequencia from "@/pages/adm/Frequencia";
import Pagamento from "@/pages/adm/Pagamento";
import AgendaAdm from "@/pages/adm/AdminAgenda";  // Importação da tela AgendaAdm
import TrainingForm from '@/pages/adm/CadastroTreino'; // caminho conforme sua estrutura
import SobreNos from '@/pages/SobreNos';
import ContactUs from "./pages/contato";
//import Settings from "@/pages/settings";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LayoutLog><Login /></LayoutLog>} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password-request" element={<ResetPasswordRequest />} />
            <Route path="/attendance" element={<Layout><Frequencia /></Layout>} />
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/members" element={<Layout><Members /></Layout>} />
            <Route path="/members/new" element={<Layout><MemberForm /></Layout>} />
            <Route path="/members/edit/:id" element={<Layout><MemberForm /></Layout>} />
            <Route path="/members/view/:id" element={<Layout><MemberProfile /></Layout>} />
            <Route path="/Frequencia" element={<Layout><Frequencia /></Layout>} />
            <Route path="/agenda" element={<Layout><AgendaAdm /></Layout>} />
            <Route path="/payments" element={<Layout><Pagamento /></Layout>} />
            <Route path="/trainings" element={<Layout><TrainingForm /></Layout>} />
            <Route path="/sobre" element={<LayoutLog><SobreNos/></LayoutLog>}/>
            <Route path="/contato"element={<LayoutLog><ContactUs/></LayoutLog>}/>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
