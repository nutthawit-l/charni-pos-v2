export interface EventSummary {
    id: number;
    name: string;
    country: string;
    startAt: string;
    endAt: string;
    role: 'creator' | 'collaborator' | 'assistant' | null;
}
