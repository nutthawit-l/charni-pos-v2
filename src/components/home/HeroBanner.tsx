export function HeroBanner() {
    return (
        <section className="px-4 pt-4">
            <div className="relative h-40 overflow-hidden rounded-2xl bg-surface-container">
                <div className="absolute left-4 top-4 h-16 w-16 rotate-12 rounded-lg bg-outline-variant/60" />
                <div className="absolute right-6 top-8 h-20 w-20 -rotate-6 rounded-full bg-outline-variant/40" />
                <div className="absolute bottom-4 left-1/3 h-12 w-24 rounded-lg bg-outline-variant/50" />
            </div>
        </section>
    );
}
