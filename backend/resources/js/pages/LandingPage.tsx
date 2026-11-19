import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

const register = '/login?mode=register';
const action = 'inline-flex items-center justify-center gap-4 rounded-lg bg-[#1B4332] px-6 py-3 font-semibold text-[#FDFBF7] hover:bg-[#2D6A4F]';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#212529]">
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
          </div>
          <figure className="border-l-8 border-[#E85D04] bg-[#FDFBF7] p-6 ring-1 ring-[#E5DDD0] sm:p-10">
            <figcaption className="text-sm text-[#495057]">Ficha técnica de exemplo</figcaption>
            <h2 className="mt-3 text-4xl font-semibold">Bolo de cenoura</h2>
            <p className="mt-1 mb-6 text-[#495057]">Rendimento de 12 fatias</p>
            <dl className="tabular-nums">
              {[['Ingredientes', 'R$ 18,00'], ['Mão de obra', 'R$ 12,00'], ['Custos indiretos', 'R$ 6,00']].map(([label, value]) => (
                <div className="flex justify-between gap-3 border-t border-[#E5DDD0] py-3" key={label}><dt>{label}</dt><dd>{value}</dd></div>
              ))}
              <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 border-t-2 border-[#2D6A4F] pt-4 text-[#1B4332]"><dt>Custo por fatia</dt><dd className="font-heading text-3xl font-semibold">R$ 3,00</dd></div>
            </dl>
          </figure>
        </section>
        <section className="grid gap-8 border-t border-[#E5DDD0] py-12 md:grid-cols-2 md:py-16">
          <h2 className="max-w-xs text-4xl font-semibold">Da despensa à ficha técnica</h2>
          <div className="space-y-6">
            <p><strong>Despensa de insumos.</strong> Registre o valor e a quantidade de cada compra para conhecer o custo unitário de cada ingrediente.</p>
            <p><strong>Receitas e rendimento.</strong> Combine os insumos na ficha técnica e veja quanto custa produzir cada unidade de pão, doce ou bolo.</p>
            <p><strong>Assistente de Custos.</strong> Tire dúvidas com a IA usando os ingredientes e as receitas do seu catálogo.</p>
            <Link className={action} to={register} data-umami-event="landing-cta-final">Começar minha ficha técnica <ArrowRight size={18} aria-hidden /></Link>
          </div>
        </section>
      </main>
    </div>
  );
}
