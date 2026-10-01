import { Container } from "@/components/layout/Container";

export function StatStrip({
  items,
}: {
  items: { value: string; unit: string; label: string; sub?: string }[];
}) {
  return (
    <section className="stat-rail border-t border-line">
      <Container className="grid grid-cols-2 gap-x-6 gap-y-10 py-16 lg:grid-cols-4 lg:py-20">
        {items.map((item) => (
          <div key={item.label} className="stat-cell flex flex-col gap-4">
            <p className="type-stat text-ink">
              {item.value}
              {item.unit ? <span className="type-h3">{item.unit}</span> : null}
            </p>
            <p className="type-sm text-ink-2">{item.label}</p>
            {item.sub ? <p className="type-xs text-ink-3">{item.sub}</p> : null}
          </div>
        ))}
      </Container>
    </section>
  );
}
