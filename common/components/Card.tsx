interface CardProps {
    img: React.ReactNode
    price: number
    title: string
    subtitle: string

    // Usamos React.ReactNode en vez de 'any' para permitir texto, JSX, estrellitas, etc.
    metadata: React.ReactNode
    description: string
}

export default function Card(props: CardProps) {
    return <div className="card bg-base-100 w-96 shadow-sm">
        <figure>
            {props.img}
        </figure>
        <div className="card-body">
            <section>
                <h1 className="text-[var(--color-primary)] font-bold card-title">{props.price} Gs</h1>
            </section>
            <section>
                <h1 className="card-title ">{props.title}</h1>
            </section>
            <section>
                <h2>{props.subtitle}</h2>
            </section>
            <section>
                {props.metadata}
            </section>
            <section>
                {props.description}
            </section>
        </div>
    </div>
}