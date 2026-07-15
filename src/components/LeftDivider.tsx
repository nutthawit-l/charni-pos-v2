export function LeftDivider({ label }: { label: string }) {
    return (
        <div className="flex h-6 items-center py-2">
            <div className="flex h-6 shrink-0 item-center px-4">
                <span className="text-sm font-medium text-outline">{label}</span>
            </div>
            <div className="flex h-6 flex-1 items-center pr-4">
                <div className="h-px w-full bg-outline"></div>
            </div>
        </div>
    )
}