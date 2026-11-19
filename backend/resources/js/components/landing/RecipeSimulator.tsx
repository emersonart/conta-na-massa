import { useState } from 'react';

const examples = [
  { name: 'Bolo de cenoura', unit: 'fatia', yield: 12, item: 'Farinha', quantity: 0.3, price: 6, other: 16.2, minutes: 45 },
  { name: 'Marmita de frango', unit: 'marmita', yield: 8, item: 'Frango', quantity: 1.2, price: 20, other: 24, minutes: 60 },
  { name: 'Cento de coxinhas', unit: 'coxinha', yield: 100, item: 'Frango', quantity: 1.5, price: 20, other: 35, minutes: 120 },
];
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const money = (value: number) => brl.format(value);

function Worksheet({ recipe }: { recipe: typeof examples[number] }) {
  const [price, setPrice] = useState(String(recipe.price));
  const [count, setCount] = useState(String(recipe.yield));
  const [overhead, setOverhead] = useState('20');
  const [markup, setMarkup] = useState('30');
  const fields = [
    { label: recipe.item + ' (R$/kg)', value: price, set: setPrice, min: 0, step: 'any', event: 'ingredient' },
    { label: 'Unidades por receita', value: count, set: setCount, min: 1, step: '1', event: 'yield' },
    { label: 'Custos indiretos (%)', value: overhead, set: setOverhead, min: 0, step: 'any', event: 'overhead' },
    { label: 'Lucro sobre o custo (%)', value: markup, set: setMarkup, min: 0, step: 'any', event: 'profit' },
  ];
  const base = recipe.quantity * Number(price) + recipe.other + recipe.minutes / 60 * 20;
  const total = base * (1 + Number(overhead) / 100);
  const unit = total / Number(count);
  const profit = unit * Number(markup) / 100;
  const valid = fields.every(f => f.value !== '' && Number(f.value) >= f.min) && Number.isInteger(Number(count)) && Number.isFinite(unit + profit);
  return <>
    <p className="my-4 text-sm leading-relaxed text-[#495057]">Neste lote entram {recipe.quantity.toLocaleString('pt-BR')} kg de {recipe.item.toLowerCase()}, {money(recipe.other)} nos demais insumos e {recipe.minutes} minutos de trabalho a R$ 20,00/h.</p>
    <div className="grid grid-cols-2 gap-3">
      {fields.map(f => <label key={f.event} className="flex flex-col justify-between gap-1 text-sm font-semibold">{f.label}
        <input type="number" min={f.min} step={f.step} value={f.value} onChange={e => f.set(e.target.value)} data-umami-event={'landing-sim-' + f.event} className="w-full rounded border border-[#E5DDD0] bg-[#F8F6F0] p-2 tabular-nums focus:outline-[#2D6A4F]" />
      </label>)}
    </div>
    <div aria-live="polite" aria-atomic="true" className="mt-5">
      {!valid && <p>Informe valores positivos ou zero e um rendimento inteiro de pelo menos uma unidade.</p>}
      <dl className="tabular-nums">
        {([['Custo do lote', total], ['Custo por ' + recipe.unit, unit], ['Lucro por ' + recipe.unit, profit], ['Venda por ' + recipe.unit, unit + profit]] as const).map(([label, value], index) =>
          <div key={label} className={'flex justify-between gap-2 border-t py-2 ' + (index === 3 ? 'border-[#2D6A4F] text-lg font-bold text-[#1B4332]' : 'border-[#E5DDD0] text-sm')}><dt>{label}</dt><dd>{valid ? money(value) : '—'}</dd></div>)}
      </dl>
    </div>
  </>;
}

export function RecipeSimulator() {
  const [index, setIndex] = useState(0);
  return <section id="simulador" aria-labelledby="sim-title" className="min-w-0 border-t-4 border-[#E85D04] bg-[#FDFBF7] p-5 ring-1 ring-[#E5DDD0] sm:p-8">
    <h2 id="sim-title" className="text-2xl font-semibold">Simule uma ficha técnica</h2>
    <label className="mt-4 block text-sm">Receita ilustrativa
      <select value={index} onChange={e => setIndex(Number(e.target.value))} data-umami-event="landing-sim-recipe" className="mt-1 block w-full border-b border-[#E5DDD0] bg-[#FDFBF7] py-2 font-heading text-xl font-semibold">{examples.map((r,i) => <option value={i} key={r.name}>{r.name}</option>)}</select>
    </label>
    <Worksheet key={index} recipe={examples[index]} />
  </section>;
}
