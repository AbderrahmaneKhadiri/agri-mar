export default function PlaceholderPage({ title }: { title: string }) {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <div className="h-96 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-white shadow-sm">
                <p className="text-lg font-medium text-slate-600">Bientôt disponible</p>
                <p className="text-sm">Cette section est en cours de développement pour AgriMar.</p>
            </div>
        </div>
    );
}
