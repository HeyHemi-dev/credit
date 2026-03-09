import { cn } from '@/lib/utils'

type FAQItem = {
  question: string
  answer: string
}

type FAQSectionProps = {
  title?: string
  intro?: string
  items: ReadonlyArray<FAQItem>
  className?: string
}

export function FAQSection({
  title = 'FAQ',
  intro,
  items,
  className,
}: FAQSectionProps) {
  return (
    <section className={cn('grid gap-6', className)} aria-labelledby="faq-title">
      <div className="grid gap-2">
        <h2
          id="faq-title"
          className="text-sm leading-normal font-normal tracking-[0.2em] text-muted-foreground uppercase"
        >
          {title}
        </h2>
        {intro && (
          <p className="text-xl leading-normal font-light text-pretty">{intro}</p>
        )}
      </div>

      <div className="grid gap-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="rounded-3xl border border-border bg-background px-5 py-4 open:bg-muted/30"
          >
            <summary className="cursor-pointer list-none pr-6 text-lg leading-normal font-normal marker:hidden [&::-webkit-details-marker]:hidden">
              {item.question}
            </summary>
            <p className="pt-3 text-base leading-relaxed font-light text-muted-foreground">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
