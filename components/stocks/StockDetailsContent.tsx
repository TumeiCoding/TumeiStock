import TradingViewWidget from "@/components/TradingViewWidget";
import WatchlistButton from "@/components/WatchlistButton";
import StockSentimentCard from "@/components/stocks/StockSentimentCard";
import {
    SECONDARY_CHART_WIDGET_CONFIG,
    TECHNICAL_ANALYSIS_WIDGET_CONFIG,
    COMPANY_PROFILE_WIDGET_CONFIG,
} from "@/lib/constants";

import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { isStockInWatchlist } from '@/lib/actions/watchlist.actions';
import { getStockSentimentInsights } from '@/lib/actions/adanos.actions';
import { formatSymbolForTradingView } from '@/lib/utils';
import { getMarketInstrument } from '@/lib/market-instruments';

export default async function StockDetailsContent({ symbol }: { symbol: string }) {
    const tvSymbol = formatSymbolForTradingView(symbol);
    const instrument = getMarketInstrument(symbol);
    const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

    const session = await auth.api.getSession({
        headers: await headers()
    });
    const userId = session?.user?.id;
    const [isInWatchlist, sentimentInsights] = await Promise.all([
        userId ? isStockInWatchlist(userId, symbol) : Promise.resolve(false),
        instrument ? Promise.resolve(null) : getStockSentimentInsights(symbol),
    ]);

    return (
        <div className="flex min-h-screen p-4 md:p-6 lg:p-8">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {/* Left column */}
                <div className="flex flex-col gap-6">
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}advanced-chart.js`}
                        config={SECONDARY_CHART_WIDGET_CONFIG(tvSymbol)}
                        className="custom-chart"
                        height={600}
                        allowExpand={true}
                    />
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <WatchlistButton
                            symbol={symbol.toUpperCase()}
                            company={instrument?.name ?? symbol.toUpperCase()}
                            isInWatchlist={isInWatchlist}
                            userId={userId}
                        />
                    </div>

                    {sentimentInsights && <StockSentimentCard insight={sentimentInsights} />}

                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}technical-analysis.js`}
                        config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(tvSymbol)}
                        height={400}
                    />

                    {!instrument && (
                        <TradingViewWidget
                            scriptUrl={`${scriptUrl}company-profile.js`}
                            config={COMPANY_PROFILE_WIDGET_CONFIG(tvSymbol)}
                            height={440}
                        />
                    )}
                </div>
            </section>
        </div>
    );
}
