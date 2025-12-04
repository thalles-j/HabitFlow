import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { toast } from 'sonner';

export function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!name || !email || !password) throw new Error('Preencha todos os campos');
      if (password.length < 6) throw new Error('A senha deve ter no mínimo 6 caracteres');

      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      
      toast.success('Cadastro realizado! Faça login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#09090A] text-white flex flex-col relative overflow-hidden font-sans selection:bg-violet-500 selection:text-white items-center justify-center px-4">
       
       {/* Background Grid Effect */}
       <div className="absolute inset-0 -z-10 h-full w-full bg-[#09090A] bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]">
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-violet-600 opacity-20 blur-[120px]"></div>
       </div>

       <div className="w-full max-w-md mb-20">
          <Link 
            to="/"
            className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} /> Voltar para o início
          </Link>

          <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl shadow-2xl backdrop-blur-xl">
            <div className="text-left mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Crie sua conta
              </h2>
              <p className="text-zinc-400 text-sm">
                Comece a rastrear seus hábitos hoje mesmo.
              </p>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleRegister}>
              
              <div className="flex flex-col gap-2 text-left">
                <label className="text-xs font-semibold text-zinc-300 uppercase">Nome</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-zinc-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="Seu nome"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-zinc-600"
                    autoFocus
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 text-left">
                <label className="text-xs font-semibold text-zinc-300 uppercase">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-zinc-500" size={18} />
                  <input 
                    type="email" 
                    placeholder="seu@email.com"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-zinc-600"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 text-left">
                <label className="text-xs font-semibold text-zinc-300 uppercase">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-zinc-500" size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-zinc-600"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="mt-4 w-full bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Criar conta gratuita' : 'Criar conta gratuita'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-zinc-500">
                Já tem uma conta? 
              </span>
              <Link 
                to="/login"
                className="text-violet-400 hover:text-violet-300 font-medium hover:underline transition-colors ml-1"
              >
                Fazer login
              </Link>
            </div>
          </div>
       </div>
    </div>
  )
}