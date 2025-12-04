import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Footer } from '../components/Footer';

export function Intro() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {}
    }
  }, []);

  const onAction = () => {
    if (user) {
      navigate('/app');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090A] text-white flex flex-col relative overflow-hidden font-sans selection:bg-violet-500 selection:text-white">
       
       {/* Background Grid Effect */}
       <div className="absolute inset-0 -z-10 h-full w-full bg-[#09090A] bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]">
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-violet-600 opacity-20 blur-[120px]"></div>
       </div>

       {/* Navbar */}
       <header className="w-full max-w-6xl mx-auto p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { window.scrollTo(0,0); }}>
            <div className="bg-violet-600 p-1.5 rounded-lg">
               <div className="w-4 h-4 bg-white rounded-sm opacity-80" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">HabitFlow</span>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <button 
                onClick={onAction}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
              >
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-sm font-semibold text-zinc-200">{user.name}</span>
                  <span className="text-xs text-zinc-400">Ir para o App</span>
                </div>
                <img 
                  className="w-10 h-10 rounded-full border-2 border-zinc-800 p-0.5 bg-zinc-900" 
                  src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                  alt="Avatar do usuário" 
                />
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="text-zinc-400 hover:text-white font-medium text-sm transition-colors hidden sm:block">
                  Já tenho conta
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="bg-zinc-100 hover:bg-white text-zinc-900 px-5 py-2 rounded-lg font-bold text-sm transition-transform hover:scale-105 active:scale-95"
                >
                  Cadastrar
                </button>
              </>
            )}
          </div>
       </header>

       {/* Main Content */}
       <main className="flex-1 flex flex-col items-center justify-center text-center px-4 z-10 mt-10 sm:mt-0">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium mb-8 hover:border-violet-500/50 transition-colors cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            v1.0 Disponível: Controle total da sua rotina
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent max-w-4xl leading-[1.1]">
            Domine seus hábitos,<br className="hidden sm:block"/> conquiste seus dias.
          </h1>
          
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
            Pare de depender apenas da motivação. O Focus oferece a clareza visual que você precisa para construir consistência, um check-in por vez.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button 
              onClick={onAction}
              className="w-full sm:w-auto px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)] flex items-center justify-center gap-2 group"
            >
              {user ? 'Ir para o App' : 'Começar agora é grátis'}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-zinc-900/50 hover:bg-zinc-800/80 text-white rounded-xl font-bold text-lg border border-zinc-800 transition-all backdrop-blur-sm">
              Ver como funciona
            </button>
          </div>

          {/* Social Proof / Stats */}
          <div className="mt-20 pt-8 border-t border-zinc-800/50 flex flex-col sm:flex-row gap-8 sm:gap-16 text-zinc-500">
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold text-white">+10k</span>
                <span className="text-sm">Usuários ativos</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold text-white">1M+</span>
                <span className="text-sm">Hábitos completados</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold text-white">4.9/5</span>
                <span className="text-sm">Avaliação média</span>
              </div>
          </div>
       </main>
       <Footer />
    </div>
  )
}


