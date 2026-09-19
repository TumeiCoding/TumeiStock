// Curated instruments supplement Finnhub's stock lookup. Keep qualified symbols
// so commodity aliases (especially GOLD) never replace similarly named stocks.
export const MARKET_INSTRUMENTS = [
    {
        symbol: 'TVC:USOIL',
        name: 'WTI Crude Oil · WTI 原油',
        exchange: 'TVC',
        type: 'Commodity CFD',
        aliases: ['USOIL', 'WTI', 'crude oil', '原油', '美油'],
    },
    {
        symbol: 'TVC:US10Y',
        name: 'US 10 Year Treasury Yield · 美国十年期国债收益率',
        exchange: 'TVC',
        type: 'Bond Yield',
        aliases: ['US10Y', '10 year', '10-year', 'treasury', '美债', '十年期国债', '美国国债'],
    },
    {
        symbol: 'TVC:GOLD',
        name: 'Gold (USD / oz) · 黄金',
        exchange: 'TVC',
        type: 'Commodity CFD',
        aliases: ['GOLD', '黄金'],
    },
] as const;

export function getMarketInstrument(symbol: string) {
    const normalized = symbol.trim().toUpperCase();
    return MARKET_INSTRUMENTS.find((instrument) => instrument.symbol === normalized);
}

export function searchMarketInstruments(query: string): StockWithWatchlistStatus[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    return MARKET_INSTRUMENTS.filter((instrument) =>
        [instrument.symbol, instrument.name, ...instrument.aliases]
            .some((value) => value.toLowerCase().includes(normalized))
    ).map(({ symbol, name, exchange, type }) => ({
        symbol, name, exchange, type, isInWatchlist: false,
    }));
}
