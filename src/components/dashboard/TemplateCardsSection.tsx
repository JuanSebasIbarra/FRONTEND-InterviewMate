import TemplateCard from './TemplateCard'

type TemplateCardsSectionProps = {
  templates: string[]
  onAdd: () => void
  onHistory: () => void
}

function TemplateCardsSection({ templates, onAdd, onHistory }: TemplateCardsSectionProps) {
  return (
    <section className="border border-zinc-300 bg-stone-50 p-5 sm:p-7">
      <div className="mb-5 border-b border-zinc-200 pb-4">
        <h2 className="text-xs uppercase tracking-widest text-zinc-500">Template cards</h2>
      </div>

      <div className="grid gap-3">
        {templates.map((template) => (
          <TemplateCard key={template} name={template} onAdd={onAdd} onHistory={onHistory} />
        ))}
      </div>
    </section>
  )
}

export default TemplateCardsSection
