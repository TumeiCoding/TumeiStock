import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { searchMarketInstruments } from '@/lib/market-instruments';
import { formatSymbolForTradingView } from '@/lib/utils';

describe('market search', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.stubEnv('FINNHUB_API_KEY', 'test-token');
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it.each([
        [' usoil ', 'TVC:USOIL'],
        ['WTI', 'TVC:USOIL'],
        ['原油', 'TVC:USOIL'],
        ['us10y', 'TVC:US10Y'],
        ['美债', 'TVC:US10Y'],
        ['gold', 'TVC:GOLD'],
        ['黄金', 'TVC:GOLD'],
        ['TVC:GOLD', 'TVC:GOLD'],
        ['vix', 'TVC:VIX'],
        ['恐慌指数', 'TVC:VIX'],
        ['DXY', 'TVC:DXY'],
        ['美元指数', 'TVC:DXY'],
        ['US02Y', 'TVC:US02Y'],
        ['US2Y', 'TVC:US02Y'],
        ['两年期国债', 'TVC:US02Y'],
        ['BTCUSD', 'BITSTAMP:BTCUSD'],
        ['BTC/USD', 'BITSTAMP:BTCUSD'],
        ['比特币', 'BITSTAMP:BTCUSD'],
        ['ETHUSD', 'BITSTAMP:ETHUSD'],
        ['以太坊', 'BITSTAMP:ETHUSD'],
        ['ES', 'CME_MINI:ES1!'],
        ['ES1!', 'CME_MINI:ES1!'],
        ['标普期货', 'CME_MINI:ES1!'],
        ['NQ', 'CME_MINI:NQ1!'],
        ['NQ1!', 'CME_MINI:NQ1!'],
        ['纳指', 'CME_MINI:NQ1!'],
    ])('finds %s and preserves its chart symbol', (query, symbol) => {
        const results = searchMarketInstruments(query);
        expect(results[0].symbol).toBe(symbol);
        expect(formatSymbolForTradingView(results[0].symbol)).toBe(symbol);
    });

    it('does not replace bare GOLD stock symbols or qualified symbols', () => {
        expect(formatSymbolForTradingView('GOLD')).toBe('GOLD');
        expect(formatSymbolForTradingView('LSE:BT.A')).toBe('LSE:BT.A');
        expect(searchMarketInstruments('')).toEqual([]);
        expect(searchMarketInstruments('AAPL')).toEqual([]);
    });

    it('ranks ES futures before name substring matches and retains ES stock', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ result: [
                { symbol: 'ES', description: 'Eversource Energy', type: 'Common Stock' },
            ] }),
        }));
        const { searchStocks } = await import('@/lib/actions/finnhub.actions');
        const results = await searchStocks('ES');
        expect(results[0].symbol).toBe('CME_MINI:ES1!');
        expect(results.some((item) => item.symbol === 'ES' && item.type === 'Common Stock')).toBe(true);
    });

    it.each(['VIX', 'DXY', 'US10Y', 'US02Y', 'USOIL', 'BTCUSD', 'ETHUSD', 'ES', 'NQ'])(
        'finds %s through server search without Finnhub', async (query) => {
            vi.stubEnv('FINNHUB_API_KEY', '');
            const { searchStocks } = await import('@/lib/actions/finnhub.actions');
            expect(await searchStocks(query)).toEqual(searchMarketInstruments(query));
            expect((await searchStocks(query)).length).toBeGreaterThan(0);
        }
    );

    it('merges instruments before stock results without conflating GOLD', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ result: [
                { symbol: 'GOLD', description: 'Stock named GOLD', type: 'Common Stock' },
                { symbol: 'TVC:GOLD', description: 'Duplicate' },
            ] }),
        }));
        const { searchStocks } = await import('@/lib/actions/finnhub.actions');
        const results = await searchStocks('GOLD');
        expect(results.map((item) => item.symbol)).toEqual(['TVC:GOLD', 'GOLD']);
        expect(results[0].type).toBe('Commodity CFD');
        expect(results[1].type).toBe('Common Stock');
    });

    it('keeps instruments searchable when Finnhub fails', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Unavailable')));
        const { searchStocks } = await import('@/lib/actions/finnhub.actions');
        expect((await searchStocks('US10Y'))[0].symbol).toBe('TVC:US10Y');
    });

    it('keeps instruments searchable without a Finnhub token', async () => {
        vi.stubEnv('FINNHUB_API_KEY', '');
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
        const { searchStocks } = await import('@/lib/actions/finnhub.actions');
        expect((await searchStocks('USOIL'))[0].symbol).toBe('TVC:USOIL');
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('preserves international stock lookup', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ result: [
                { symbol: '0700.HK', description: 'Tencent', type: 'Common Stock' },
            ] }),
        }));
        const { searchStocks } = await import('@/lib/actions/finnhub.actions');
        const results = await searchStocks('Tencent');
        expect(results[0]).toMatchObject({ symbol: '0700.HK', exchange: 'HK' });
        expect(formatSymbolForTradingView(results[0].symbol)).toBe('HKEX:0700');
    });
});
