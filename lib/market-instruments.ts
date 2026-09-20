// Curated instruments supplement Finnhub's stock lookup. Keep qualified symbols
// so commodity aliases (especially GOLD) never replace similarly named stocks.
export const MARKET_INSTRUMENTS = [
    {
        symbol: 'TVC:VIX',
        name: 'S&P 500 Volatility Index · 恐慌指数',
        exchange: 'TVC',
        type: 'Index',
        aliases: ['VIX', 'volatility', 'fear index', '波动率', '恐慌指数'],
    },
    {
        symbol: 'TVC:DXY',
        name: 'US Dollar Index · 美元指数',
        exchange: 'TVC',
        type: 'Index',
        aliases: ['DXY', 'dollar index', '美元指数', '美指'],
    },
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
    {
        symbol: 'TVC:US02Y',
        name: 'US 2 Year Treasury Yield · 美国两年期国债收益率',
        exchange: 'TVC',
        type: 'Bond Yield',
        aliases: ['US02Y', 'US2Y', '2 year', '2-year', 'treasury', '美债', '两年期国债', '二年期国债', '美国国债'],
    },
    {
        symbol: 'BITSTAMP:BTCUSD',
        name: 'Bitcoin / US Dollar · 比特币 / 美元',
        exchange: 'BITSTAMP',
        type: 'Crypto',
        aliases: ['BTCUSD', 'BTC/USD', 'BTC', 'bitcoin', '比特币'],
    },
    {
        symbol: 'BITSTAMP:ETHUSD',
        name: 'Ethereum / US Dollar · 以太坊 / 美元',
        exchange: 'BITSTAMP',
        type: 'Crypto',
        aliases: ['ETHUSD', 'ETH/USD', 'ETH', 'ethereum', '以太坊', '以太币'],
    },
    {
        symbol: 'CME_MINI:ES1!',
        name: 'E-mini S&P 500 Futures (Continuous) · 标普500连续期货',
        exchange: 'CME_MINI',
        type: 'Continuous Futures',
        aliases: ['ES', 'ES1!', 'S&P 500', '标普', '标普期货'],
    },
    {
        symbol: 'CME_MINI:NQ1!',
        name: 'E-mini Nasdaq 100 Futures (Continuous) · 纳斯达克100连续期货',
        exchange: 'CME_MINI',
        type: 'Continuous Futures',
        aliases: ['NQ', 'NQ1!', 'Nasdaq', '纳指', '纳指期货'],
    },
] as const;

export function getMarketInstrument(symbol: string) {
    const normalized = symbol.trim().toUpperCase();
    return MARKET_INSTRUMENTS.find((instrument) => instrument.symbol === normalized);
}

export function searchMarketInstruments(query: string): StockWithWatchlistStatus[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    return MARKET_INSTRUMENTS.map((instrument) => {
        const terms = [instrument.symbol, instrument.name, ...instrument.aliases]
            .map((value) => value.toLowerCase());
        // Short tickers such as ES must outrank incidental name matches.
        const score = terms.includes(normalized) ? 3
            : terms.some((value) => value.startsWith(normalized)) ? 2
            : terms.some((value) => value.includes(normalized)) ? 1 : 0;
        return { instrument, score };
    }).filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ instrument: { symbol, name, exchange, type } }) => ({
        symbol, name, exchange, type, isInWatchlist: false,
    }));
}
