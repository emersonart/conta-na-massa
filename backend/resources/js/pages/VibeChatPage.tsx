import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAiStore } from '../stores/aiStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Send,
  Trash2,
  User as UserIcon,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Menu,
  Plus,
  MessageSquare,
  ChefHat,
  X,
} from 'lucide-react';

export const VibeChatPage: React.FC = () => {
  const {
    messages,
    sessions,
    sessionId,
    isSendingMessage,
    sendMessage,
    fetchHistory,
    fetchSessions,
    loadSession,
    startNewSession,
    clearHistory,
    fetchStats,
  } = useAiStore();

  const [inputMessage, setInputMessage] = useState('');
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
    { title: 'Cadastrar Insumos', text: 'Comprei 1kg de Leite Ninho por R$ 38,50 e 1L de leite integral por R$ 5,20. Cadastre na minha despensa.' },
    { title: 'Criar Ficha Técnica', text: 'Quero cadastrar um Bolo de Cenoura: 300g de farinha, 200g de açúcar, 3 ovos. Rende 12 fatias e leva 45 minutos.' },
    { title: 'Custos Indiretos', text: 'Como calcular os custos de gás e energia elétrica na minha produção para não ter prejuízo?' },
    { title: 'Margem Delivery vs Balcão', text: 'Qual a margem de lucro recomendada para doces e bolos no balcão comparado ao delivery?' },
  ];

  const lastMessage = messages[messages.length - 1];
  const isStreamingFirstToken =
    isSendingMessage && lastMessage && lastMessage.role === 'assistant' && !lastMessage.content;

  return (
    <div className="flex h-[calc(100vh-8rem)] max-w-6xl mx-auto animate-fadeIn relative gap-4">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed md:static inset-y-0 left-0 z-50 md:z-auto
        w-64 bg-[#FDFBF7] md:bg-white rounded-2xl border border-[#E5DDD0]
        transform transition-transform duration-300 ease-in-out flex flex-col shadow-soft md:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      >
        <div className="p-4 flex items-center justify-between md:hidden border-b border-[#E5DDD0]">
          <span className="font-bold font-heading text-[#212529]">Histórico de Conversas</span>
          <button onClick={() => setIsSidebarOpen(false)} className="text-slate-500 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3">
          <Button
            variant="primary"
            className="w-full justify-center shadow-xs"
            onClick={() => {
              startNewSession();
              setIsSidebarOpen(false);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nova Consulta
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1.5 mt-1">
            Conversas Anteriores
          </div>
          {sessions.length === 0 && (
            <div className="text-xs text-slate-400 px-2 italic">Nenhum histórico recente.</div>
          )}
          {sessions.map((session) => (
            <button
              key={session.session_id}
              onClick={() => {
                loadSession(session.session_id);
                setIsSidebarOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-2 truncate cursor-pointer ${
                sessionId === session.session_id
                  ? 'bg-orange-100/60 text-[#E85D04] font-semibold'
                  : 'text-slate-600 hover:bg-slate-100/60'
              }`}
              title={session.title}
            >
              <MessageSquare
                className={`w-3.5 h-3.5 shrink-0 ${
                  sessionId === session.session_id ? 'text-[#E85D04]' : 'text-slate-400'
                }`}
              />
              <span className="truncate block leading-tight">{session.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-[#E5DDD0] shadow-soft overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5DDD0] bg-[#FDFBF7] gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-1.5 -ml-1 text-slate-500 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Abrir histórico"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E85D04] to-[#F4A261] flex items-center justify-center text-white shadow-xs shrink-0">
              <ChefHat className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold font-heading text-[#212529] leading-tight truncate">
                  Assistente de Fichas & Custos
                </h2>
                <Badge variant="sage" size="sm" className="hidden sm:inline-flex">
                  Disponível
                </Badge>
              </div>
              <span className="text-[11px] text-slate-500 block leading-tight">
                Cálculo de rendimento, conversão de unidades e fichas técnicas
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
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

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#E85D04] flex items-center justify-center">
                <ChefHat className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-heading text-[#212529]">
                  Como posso ajudar na sua produção hoje?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Informe insumos comprados para cadastrar na despensa, solicite a estruturação de uma nova ficha técnica ou tire dúvidas de custos.
                </p>
              </div>

              {/* Quick Action Chips */}
              <div className="w-full space-y-2 text-left pt-2">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Exemplos práticos:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {promptChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleChipClick(chip.text)}
                      className="p-3 rounded-xl bg-[#FDFBF7] border border-[#E5DDD0] text-left text-xs hover:border-[#E85D04] transition-all cursor-pointer shadow-2xs group"
                    >
                      <span className="font-bold text-[#212529] block group-hover:text-[#E85D04] transition-colors">
                        {chip.title}
                      </span>
                      <span className="text-slate-600 line-clamp-1 mt-0.5">{chip.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              const isLastAssistant = !isUser && index === messages.length - 1 && isSendingMessage;

              if (!isUser && !msg.content && !isLastAssistant) {
                return null;
              }

              return (
                <div
                  key={index}
                  className={`flex gap-3 items-start ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E85D04] to-[#F4A261] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <ChefHat className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] sm:max-w-[78%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-soft ${
                      isUser
                        ? 'bg-[#E85D04] text-white rounded-tr-xs'
                        : msg.is_flagged
                        ? 'bg-rose-50 border border-rose-200 text-rose-900 rounded-tl-xs'
                        : 'bg-[#FDFBF7] border border-[#E5DDD0] text-[#212529] rounded-tl-xs'
                    }`}
                  >
                    {msg.is_flagged && (
                      <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs mb-2">
                        <AlertTriangle className="w-3.5 h-3.5" /> Aviso de Conformidade
                      </div>
                    )}

                    {msg.actions_executed && msg.actions_executed.length > 0 && (
                      <div className="mb-3 space-y-1.5 border-b border-[#E5DDD0]/70 pb-2.5">
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
                          const iconClass =
                            isDedupe || isDelete
                              ? isNotFound
                                ? 'text-amber-500'
                                : 'text-rose-500'
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
                                  <>Parâmetros financeiros atualizados com sucesso.</>
                                )}
                                {action.type === 'delete_ingredient' && (
                                  <>
                                    {action.status === 'deleted' ? (
                                      <>Ingrediente excluído: <strong>{action.name}</strong></>
                                    ) : (
                                      <>Ingrediente não encontrado: <strong>{action.name}</strong></>
                                    )}
                                  </>
                                )}
                                {action.type === 'delete_recipe' && (
                                  <>
                                    {action.status === 'deleted' ? (
                                      <>Receita excluída: <strong>{action.name}</strong></>
                                    ) : (
                                      <>Receita não encontrada: <strong>{action.name}</strong></>
                                    )}
                                  </>
                                )}
                                {action.type === 'deduplicate_ingredient' && (
                                  <>
                                    {action.status === 'deduplicated' ? (
                                      <>Duplicatas removidas: <strong>{action.name}</strong> — {action.deleted} excluído(s), 1 mantido</>
                                    ) : action.status === 'no_duplicates' ? (
                                      <>Sem duplicatas: <strong>{action.name}</strong></>
                                    ) : (
                                      <>Ingrediente não encontrado: <strong>{action.name}</strong></>
                                    )}
                                  </>
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

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
                    <div className="w-8 h-8 rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isStreamingFirstToken && (
            <div className="flex gap-3 items-center text-xs text-slate-500">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E85D04] to-[#F4A261] text-white flex items-center justify-center">
                <ChefHat className="w-4 h-4" />
              </div>
              <div className="bg-[#FDFBF7] border border-[#E5DDD0] px-3.5 py-2.5 rounded-2xl rounded-tl-xs flex items-center gap-2 shadow-2xs">
                <span className="w-2 h-2 bg-[#E85D04] rounded-full animate-pulse" />
                <span>Calculando e preparando resposta...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-[#E5DDD0] bg-[#FDFBF7] shrink-0">
          <form onSubmit={handleSend} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Digite sua dúvida ou descreva ingredientes e receitas..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isSendingMessage}
              className="flex-1 min-h-[46px] rounded-xl border border-[#E5DDD0] bg-white px-4 py-2.5 text-sm text-[#212529] placeholder:text-slate-400 focus:border-[#E85D04] focus:outline-none focus:ring-2 focus:ring-[#E85D04]/15 transition-all shadow-2xs"
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!inputMessage.trim() || isSendingMessage}
              className="min-h-[46px] px-4 rounded-xl shrink-0"
              aria-label="Enviar mensagem"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
