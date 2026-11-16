import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAiStore } from '../stores/aiStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Send,
  Trash2,
  ShieldCheck,
  Brain,
  User as UserIcon,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Menu,
  Plus,
  MessageSquare,
} from 'lucide-react';

export const VibeChatPage: React.FC = () => {
  const {
    messages,
    sessions,
    sessionId,
    userProfile,
    isSendingMessage,
    sendMessage,
    fetchHistory,
    fetchSessions,
    loadSession,
    startNewSession,
    clearHistory,
    stats,
    fetchStats,
  } = useAiStore();

  const [inputMessage, setInputMessage] = useState('');
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSessions();
    fetchHistory();
    fetchStats();
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSendingMessage]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSendingMessage) return;

    const msg = inputMessage;
    setInputMessage('');
    await sendMessage(msg);
  };

  const handleChipClick = async (prompt: string) => {
    if (isSendingMessage) return;
    setInputMessage('');
    await sendMessage(prompt);
  };

  const promptChips = [
    'Comprei 1kg de Leite Ninho por R$ 38,50 e 1L de leite por R$ 5,20. Cadastre na minha despensa.',
    'Quero criar um Bolo de Cenoura: 300g de farinha, 200g de açúcar, 3 ovos. Rende 12 fatias e leva 45min.',
    'Como calcular os custos de gás e luz na minha produção para não ter prejuízo?',
    'Qual a margem de lucro recomendada para vender doces finos no delivery e no balcão?',
  ];

  // Helper to know if assistant is actively streaming empty content
  const lastMessage = messages[messages.length - 1];
  const isStreamingFirstToken =
    isSendingMessage && lastMessage && lastMessage.role === 'assistant' && !lastMessage.content;

  return (
    <div className="flex h-[calc(100vh-8rem)] max-w-6xl mx-auto animate-fadeIn relative gap-4">

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 md:z-auto
        w-64 bg-[#FDFBF7] md:bg-transparent border-r md:border-r-0 border-[#E5DDD0]
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 flex items-center justify-between md:hidden border-b border-[#E5DDD0] bg-white">
          <span className="font-bold font-heading text-[#212529]">Histórico</span>
          <button onClick={() => setIsSidebarOpen(false)} className="text-slate-500">✕</button>
        </div>

        <div className="p-3">
          <Button
            variant="primary"
            className="w-full justify-center shadow-sm"
            onClick={() => {
              startNewSession();
              setIsSidebarOpen(false);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Novo Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-2 mt-2">
            Conversas Anteriores
          </div>
          {sessions.length === 0 && (
            <div className="text-xs text-slate-400 px-2 italic">Nenhum histórico.</div>
          )}
          {sessions.map((session) => (
            <button
              key={session.session_id}
              onClick={() => {
                loadSession(session.session_id);
                setIsSidebarOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs sm:text-sm transition-colors flex items-center gap-2 truncate ${
                sessionId === session.session_id
                  ? 'bg-orange-100/50 text-[#E85D04] font-medium'
                  : 'text-slate-600 hover:bg-black/5'
              }`}
              title={session.title}
            >
              <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${sessionId === session.session_id ? 'text-[#E85D04]' : 'text-slate-400'}`} />
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className="truncate block leading-tight">{session.title}</span>
                {stats?.history?.find((s: any) => s.session_id === session.session_id)?.cost ? (
                  <span className="text-[10px] text-orange-600 font-medium">
                    R$ {Number(stats.history.find((s: any) => s.session_id === session.session_id).cost).toFixed(2)}
                  </span>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white md:bg-transparent rounded-2xl md:rounded-none overflow-hidden border border-[#E5DDD0] md:border-0 shadow-sm md:shadow-none">
        {/* Top Bar with AI Status & Security */}
        <div className="flex items-center justify-between p-3 md:pb-3 md:pt-0 border-b border-[#E5DDD0] bg-white md:bg-transparent gap-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              className="md:hidden p-1.5 -ml-1 text-slate-500 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#E85D04] to-amber-400 flex items-center justify-center text-white text-lg sm:text-xl shadow-md shrink-0">
              👨‍🍳
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold font-heading text-[#212529] flex items-center gap-2 leading-none truncate">
                Chef Vibe
                <Badge variant="sage" size="sm" className="hidden sm:inline-flex">
                  Online
                </Badge>
              </h2>
              <span className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#2D6A4F] shrink-0" /> Guardrails Ativos
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowProfileDrawer(!showProfileDrawer)}
              leftIcon={<Brain className="w-3.5 h-3.5 text-[#E85D04]" />}
              className="px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Memória 30d</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearHistory()}
              className="text-slate-400 hover:text-rose-600 px-2"
              title="Limpar Conversa Atual"
              leftIcon={<Trash2 className="w-4 h-4" />}
            />
          </div>
        </div>

      {/* Memory Profile Popover / Card */}
      {showProfileDrawer && (
        <div className="my-3 p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs sm:text-sm text-amber-950 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between font-bold font-heading">
            <span className="flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-[#E85D04]" /> Perfil de Preferências Memorizado (30 Dias)
            </span>
            <button onClick={() => setShowProfileDrawer(false)} className="text-amber-800 hover:text-black">
              ✕
            </button>
          </div>
          <p className="text-slate-700">
            {userProfile?.summary || 'A IA ainda está aprendendo suas preferências culinárias conforme você conversa.'}
          </p>
          {userProfile?.preferences && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {Object.entries(userProfile.preferences).map(([key, val]) => (
                <span key={key} className="px-2 py-0.5 rounded-md bg-white/80 border border-amber-200 text-[11px] font-medium text-amber-900">
                  {key}: {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto p-6 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-orange-100 text-[#E85D04] text-3xl flex items-center justify-center shadow-inner">
              ✨
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold font-heading text-[#212529]">
                Olá, Chef! O que vamos precificar hoje?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Você pode falar comigo naturalmente. Posso cadastrar ingredientes na sua despensa, montar fichas técnicas completas e calcular seu lucro real considerando mão de obra e custos indiretos.
              </p>
            </div>

            {/* Quick Action Chips */}
            <div className="w-full space-y-2 text-left pt-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Sugestões para começar:
              </span>
              <div className="grid grid-cols-1 gap-2">
                {promptChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChipClick(chip)}
                    className="p-2.5 rounded-xl bg-white border border-[#E5DDD0] text-xs text-left text-slate-700 hover:border-[#E85D04] hover:bg-[#FDFBF7] transition-all cursor-pointer shadow-2xs"
                  >
                    💬 {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isLastAssistant = !isUser && index === messages.length - 1 && isSendingMessage;

            // Skip rendering empty assistant initial placeholder before first chunk
            if (!isUser && !msg.content && !isLastAssistant) {
              return null;
            }

            return (
              <div
                key={index}
                className={`flex gap-3 items-start ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E85D04] to-amber-500 text-white text-sm flex items-center justify-center shrink-0 shadow-xs mt-1">
                    👨‍🍳
                  </div>
                )}

                <div
                  className={`max-w-[90%] sm:max-w-[80%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-soft ${
                    isUser
                      ? 'bg-[#E85D04] text-white rounded-tr-xs'
                      : msg.is_flagged
                      ? 'bg-rose-50 border border-rose-200 text-rose-900 rounded-tl-xs'
                      : 'bg-white border border-[#E5DDD0] text-[#212529] rounded-tl-xs'
                  }`}
                >
                  {msg.is_flagged && (
                    <div className="flex items-center gap-1 text-rose-600 font-bold text-xs mb-2">
                      <AlertTriangle className="w-3.5 h-3.5" /> Bloqueio Preventivo
                    </div>
                  )}

                      {msg.actions_executed && msg.actions_executed.length > 0 && (
                    <div className="mb-3 space-y-1.5 border-b border-amber-100 pb-2.5">
                      {msg.actions_executed.map((action, aIdx) => {
                        const isDelete = action.type === 'delete_ingredient' || action.type === 'delete_recipe';
                        const isDedupe = action.type === 'deduplicate_ingredient';
                        const isNotFound = action.status === 'not_found';
                        const colorClass = isDedupe
                          ? action.status === 'deduplicated'
                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                            : 'bg-amber-50 border-amber-200 text-amber-800'
                          : isDelete
                          ? isNotFound
                            ? 'bg-amber-50 border-amber-200 text-amber-800'
                            : 'bg-rose-50 border-rose-200 text-rose-800'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-800';
                        const iconClass = isDedupe || isDelete
                          ? isNotFound ? 'text-amber-500' : 'text-rose-500'
                          : 'text-emerald-600';

                        return (
                          <div
                            key={aIdx}
                            className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium ${colorClass}`}
                          >
                            <CheckCircle2 className={`w-4 h-4 shrink-0 ${iconClass}`} />
                            <span>
                              {action.type === 'create_ingredient' && (
                                <>
                                  Ingrediente cadastrado na despensa: <strong>{action.name}</strong> (R$ {Number(action.cost_per_unit_brl || 0).toFixed(2)}/{action.unit || 'un'})
                                </>
                              )}
                              {action.type === 'create_recipe' && (
                                <>
                                  Ficha técnica salva: <strong>{action.name}</strong> ({action.yield_quantity} {action.yield_unit})
                                </>
                              )}
                              {action.type === 'update_cost_settings' && (
                                <>
                                  Parâmetros financeiros atualizados com sucesso!
                                </>
                              )}
                              {action.type === 'delete_ingredient' && (
                                <>
                                  {action.status === 'deleted'
                                    ? <>Ingrediente excluído: <strong>{action.name}</strong></>
                                    : <>Ingrediente não encontrado: <strong>{action.name}</strong></>
                                  }
                                </>
                              )}
                              {action.type === 'delete_recipe' && (
                                <>
                                  {action.status === 'deleted'
                                    ? <>Receita excluída: <strong>{action.name}</strong></>
                                    : <>Receita não encontrada: <strong>{action.name}</strong></>
                                  }
                                </>
                              )}
                              {action.type === 'deduplicate_ingredient' && (
                                <>
                                  {action.status === 'deduplicated'
                                    ? <>Duplicatas removidas: <strong>{action.name}</strong> — {action.deleted} excluído(s), 1 mantido</>
                                    : action.status === 'no_duplicates'
                                    ? <>Sem duplicatas: <strong>{action.name}</strong></>
                                    : <>Ingrediente não encontrado: <strong>{action.name}</strong></>
                                  }
                                </>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Message Content formatted as Markdown */}
                  {isUser ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <div className="prose prose-sm max-w-none text-[#212529] prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-[#212529] prose-strong:font-bold">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                      {isLastAssistant && (
                        <span className="inline-block w-2 h-4 ml-1 bg-[#E85D04] animate-pulse align-middle" />
                      )}
                    </div>
                  )}

                  <span
                    className={`block text-[10px] mt-2 ${
                      isUser ? 'text-orange-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.created_at
                      ? new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Agora'}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-1">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isStreamingFirstToken && (
          <div className="flex gap-3 items-center text-xs text-slate-500 animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E85D04] to-amber-500 text-white text-sm flex items-center justify-center">
              👨‍🍳
            </div>
            <div className="bg-white border border-[#E5DDD0] p-3 rounded-2xl rounded-tl-xs flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 bg-[#E85D04] rounded-full animate-ping" />
              <span>Chef Vibe está analisando a receita e calculando custos...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form with Touch Optimization */}
      <div className="pt-2 pb-2 md:pb-0 px-2 md:px-0 border-t border-[#E5DDD0] bg-white md:bg-transparent shrink-0">
        <form onSubmit={handleSend} className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Pergunte ao Chef ou informe ingredientes e preços..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isSendingMessage}
            className="flex-1 min-h-[50px] rounded-2xl border border-[#E5DDD0] bg-white px-4 py-3 text-sm text-[#212529] placeholder:text-slate-400 focus:border-[#E85D04] focus:outline-none focus:ring-2 focus:ring-[#E85D04]/15 transition-all shadow-xs"
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputMessage.trim() || isSendingMessage}
            className="min-h-[50px] px-4 sm:px-5 rounded-2xl shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>

      </div> {/* End Main Chat Area */}
    </div>
  );
};
