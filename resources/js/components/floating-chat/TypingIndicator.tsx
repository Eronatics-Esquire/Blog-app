export function TypingIndicator() {
    return (
        <div className="flex items-end gap-1 px-3">
            <div className="flex h-6 w-14 items-center justify-center rounded-full bg-gray-200">
                <div className="flex gap-0.5">
                    <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500"
                        style={{ animationDelay: '0ms' }}
                    />
                    <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500"
                        style={{ animationDelay: '150ms' }}
                    />
                    <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500"
                        style={{ animationDelay: '300ms' }}
                    />
                </div>
            </div>
        </div>
    );
}
