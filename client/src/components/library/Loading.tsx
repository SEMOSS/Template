import { Spinner } from "../tailwind";

export const Loading = (): JSX.Element => {
    return (
        <div className="fixed inset-0 z-[9999] bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <div className="rounded-xl p-8 flex flex-col items-center space-y-4 min-w-[200px]">
            <Spinner />
                <p className="text-sm font-medium">Loading...</p>
            </div>
        </div>

    )
};