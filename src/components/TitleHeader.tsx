interface TitleHeaderProps {
    title: string;
}

export function TitleHeader({ title }: TitleHeaderProps) {
    return (
        <header className="px-4 py-2">
            <h1 className="text-2xl font-normal text-on-surface">{title}</h1>
        </header>
    );
}
