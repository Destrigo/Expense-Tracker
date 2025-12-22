import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ExpenseProvider } from "@/contexts/ExpenseContext";
import { BottomNav } from "@/components/layout/BottomNav";
import Index from "./pages/Index";
import Expenses from "./pages/Expenses";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import BankConnections from "./pages/BankConnections";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
     <CurrencyProvider>
      <ExpenseProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/bank-connections" element={<BankConnections />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </BrowserRouter>
      </ExpenseProvider>
     </CurrencyProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
