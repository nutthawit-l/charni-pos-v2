interface EventTitleHeaderProps {
    eventName: string;
}

export function EventTitleHeader({ eventName }: EventTitleHeaderProps) {
    return (
        <header className="px-4 py-2">
            <h1 className="text-2xl font-normal text-on-surface">{eventName}</h1>
        </header>
    );
}
