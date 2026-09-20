"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ExternalLink, Loader2, X } from "lucide-react";

interface WatchlistStockNavProps {
    items: { symbol: string; company: string }[];
}

export default function WatchlistStockNav({ items }: WatchlistStockNavProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const [loadedSymbol, setLoadedSymbol] = useState<string | null>(null);
    const frameRef = useRef<HTMLIFrameElement>(null);
    const router = useRouter();
    const active = items.find((item) => item.symbol === selected);

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            if (event.origin === window.location.origin &&
                event.source === frameRef.current?.contentWindow &&
                event.data?.type === "watchlist-updated") {
                router.refresh();
            }
        };
        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, [router]);

    const toggleStock = (symbol: string) => {
        setLoadedSymbol(null);
        setSelected(active?.symbol === symbol ? null : symbol);
    };

    return (
        <section aria-label="Watchlist stocks" className="w-full min-w-0 rounded-xl border border-gray-700 bg-gray-900/50">
            <nav aria-label="Select a watchlist stock" className="flex flex-wrap items-center gap-3 p-4">
                <span className="shrink-0 text-sm font-medium text-gray-400">Watchlist</span>
                {items.length === 0 ? (
                    <p className="text-sm text-gray-500">Add stocks to your watchlist to view them here.</p>
                ) : items.map((item) => (
                    <button
                        key={item.symbol}
                        type="button"
                        title={item.company}
                        aria-expanded={active?.symbol === item.symbol}
                        aria-controls={active?.symbol === item.symbol ? "watchlist-stock-details" : undefined}
                        onClick={() => toggleStock(item.symbol)}
                        className={`flex shrink-0 items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 ${active?.symbol === item.symbol ? "border-yellow-400 bg-yellow-400/10 text-yellow-400" : "border-gray-700 bg-gray-800 text-gray-200 hover:border-gray-500 hover:bg-gray-700"}`}
                    >
                        {item.symbol}
                        <ChevronDown aria-hidden="true" className={`size-4 transition-transform ${active?.symbol === item.symbol ? "rotate-180" : ""}`} />
                    </button>
                ))}
            </nav>

            {active && (
                <div id="watchlist-stock-details" className="border-t border-gray-700">
                    <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3">
                        <div className="min-w-0">
                            <h2 className="font-semibold text-white">{active.symbol}</h2>
                            <p className="break-words text-sm text-gray-400">{active.company}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-4">
                            <a href={`/stocks/${encodeURIComponent(active.symbol)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
                                <ExternalLink aria-hidden="true" className="size-4" />
                                Open full page
                            </a>
                            <button type="button" aria-label="Close stock details" onClick={() => setSelected(null)} className="rounded p-2 text-gray-400 hover:bg-gray-800 hover:text-white">
                                <X aria-hidden="true" className="size-4" />
                            </button>
                        </div>
                    </div>
                    {loadedSymbol !== active.symbol && (
                        <div role="status" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
                            <Loader2 aria-hidden="true" className="size-4 animate-spin" /> Loading stock details…
                        </div>
                    )}
                    <iframe
                        key={active.symbol}
                        ref={frameRef}
                        src={`/embed/stocks/${encodeURIComponent(active.symbol)}`}
                        title={`${active.symbol} stock details`}
                        onLoad={() => setLoadedSymbol(active.symbol)}
                        className="block h-[75vh] min-h-[600px] w-full rounded-b-xl border-0"
                        allowFullScreen
                    />
                </div>
            )}
        </section>
    );
}
