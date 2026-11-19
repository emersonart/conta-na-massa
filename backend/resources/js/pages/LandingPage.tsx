import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

import { RecipeSimulator } from '../components/landing/RecipeSimulator';

const register = '/login?mode=register';
const action = 'inline-flex items-center justify-center gap-4 rounded-lg bg-[#1B4332] px-6 py-3 font-semibold text-[#FDFBF7] hover:bg-[#2D6A4F]';

export function LandingPage() {
  return (
    <div className="min-h-screen [&+[role=dialog]]:static bg-[#F8F6F0] text-[#212529]">
      <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-[#E5DDD0] px-6 py-5">
        <Logo />
        <Link className="rounded px-3 py-2 font-semibold hover:underline" data-umami-event="landing-cta-login" to="/login">Entrar</Link>
      </header>
      <main className="mx-auto max-w-6xl px-6">
        <section className="grid items-center gap-12 py-12 md:grid-cols-[1.1fr_1fr] md:py-24">
          <div>
            <h1 className="max-w-[13ch] text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">Quanto custa uma fatia do seu bolo?</h1>
            <p className="my-6 max-w-md text-lg leading-relaxed text-[#495057]">Some os ingredientes, o tempo na cozinha e os custos indiretos. Defina o preço de cada porção com a sua margem de lucro.</p>
            <Link to={register} data-umami-event="landing-cta-hero" className={action}>Criar minha conta <ArrowRight size={18} aria-hidden /></Link>
            <a href="#simulador" data-umami-event="landing-sim-open" className="mt-4 block w-fit font-semibold text-[#1B4332] underline underline-offset-4">Testar com uma receita</a>
          </div>
          <RecipeSimulator />
        </section>
        <section className="border-t border-[#E5DDD0] py-12 md:py-16">
          <h2 className="text-4xl font-semibold">Da compra ao preço de venda</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              ['Registre a compra', 'Na despensa, informe o preço pago e a quantidade da embalagem. Um pacote de farinha de 1 kg por R$ 6,00 equivale a R$ 0,006 por grama.'],
              ['Monte a ficha técnica', 'Combine os insumos nas quantidades usadas e informe o rendimento e o tempo de preparo. Com 300 g daquela farinha, a receita consome R$ 1,80 do pacote.'],
              ['Defina o preço', 'Configure o valor da hora de trabalho, o percentual de custos indiretos e o lucro desejado sobre o custo. A ficha calcula o custo do lote e o preço sugerido por porção.'],
            ].map(([title, body], i) => <li key={title} className="border-t-2 border-[#2D6A4F] pt-4"><span className="text-sm text-[#495057]">Etapa {i + 1}</span><h3 className="my-2 text-2xl font-semibold">{title}</h3><p className="leading-relaxed">{body}</p></li>)}
          </ol>
        </section>
        <section className="grid gap-8 bg-[#1B4332] p-6 text-[#FDFBF7] md:grid-cols-2 md:p-10">
          <div><h2 className="text-3xl font-semibold">Assistente de Custos</h2><p className="mt-3 leading-relaxed">Consulte a IA com os insumos e receitas do seu catálogo. Você pode pedir o cadastro de uma compra, descrever uma ficha ou conferir uma conversão.</p></div>
          <div className="border-l border-[#F4A261] pl-5"><h3 className="text-sm">Conversa ilustrativa</h3><p className="my-3 font-heading text-2xl">“O quilo da farinha custa R$ 6,00. Quanto gasto em 300 g?”</p><p>“R$ 1,80. Você usa 0,3 kg do pacote. Multiplique 0,3 por R$ 6,00.”</p></div>
        </section>
        <section className="grid gap-8 border-b border-[#E5DDD0] py-12 md:grid-cols-2 md:py-16">
          <h2 className="max-w-xs text-4xl font-semibold">O que sai da sua cozinha?</h2>
          <dl className="space-y-5">{[
            ['Confeitaria artesanal', 'Divida o custo do bolo pelo número de fatias ou use uma unidade para vender o bolo inteiro.'],
            ['Marmitaria', 'Inclua a embalagem entre os insumos e distribua o custo do preparo pelas marmitas do lote.'],
            ['Salgados sob encomenda', 'Informe o rendimento em unidades para calcular o preço de uma coxinha e montar o orçamento do cento.'],
            ['Padaria', 'Registre a farinha usada na massa e o tempo de preparo para precificar os pães da fornada.'],
          ].map(([title, body]) => <div key={title}><dt className="font-heading text-xl font-semibold">{title}</dt><dd className="text-[#495057]">{body}</dd></div>)}</dl>
        </section>
        <section className="grid gap-8 py-12 md:grid-cols-2 md:py-16">
          <h2 className="text-4xl font-semibold">Dúvidas sobre o cálculo</h2>
          <div>{[
            ['Se o ingrediente subir, preciso refazer a receita?', 'Atualize o preço da compra na despensa. Ao consultar a ficha, o cálculo usa o custo dos insumos cadastrados.'],
            ['Onde entram gás e energia?', 'Nas configurações de custos indiretos. O percentual incide sobre ingredientes e mão de obra antes de acrescentar o lucro.'],
            ['Como funciona o percentual de lucro?', 'Ele é aplicado sobre o custo. Se a porção custa R$ 10,00 e você escolhe 30%, o preço sugerido é R$ 13,00 e o lucro estimado é R$ 3,00.'],
            ['Preciso me cadastrar para simular?', 'Você pode testar os exemplos aqui. Para montar sua própria despensa e guardar suas receitas, crie uma conta.'],
          ].map(([q,a]) => <details key={q} className="border-b border-[#E5DDD0] py-4"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-2 leading-relaxed">{a}</p></details>)}
          <Link className={action + ' mt-8'} to={register} data-umami-event="landing-cta-final">Começar minha ficha técnica <ArrowRight size={18} aria-hidden /></Link></div>
        </section>
      </main>
    </div>
  );
}
