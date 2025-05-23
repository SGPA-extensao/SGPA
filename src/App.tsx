import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/Layout";

import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ResetPassword from "@/pages/ResetPassword";
import ResetPasswordRequest from "@/pages/ResetPasswordRequest";
import Dashboard from "@/pages/Dashboard";
import Members from "@/pages/Members";
import MemberForm from "@/pages/MemberForm";
import MemberProfile from "@/pages/MemberProfile";
import NotFound from "@/pages/NotFound";

import AgendaAdm from "@/pages/AdminAgenda";  // Importação da tela AgendaAdm

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password-request" element={<ResetPasswordRequest />} />
            
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/members" element={<Layout><Members /></Layout>} />
            <Route path="/members/new" element={<Layout><MemberForm /></Layout>} />
            <Route path="/members/edit/:id" element={<Layout><MemberForm /></Layout>} />
            <Route path="/members/view/:id" element={<Layout><MemberProfile /></Layout>} />

            <Route path="/agenda" element={<Layout><AgendaAdm /></Layout>} />  {/* Rota da agenda */}

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
