# 🌍 Market Support & Limitations

OpenStock supports stocks from multiple exchanges worldwide, but there are important limitations to be aware of based on our data providers (Finnhub & TradingView).

## ✅ Fully Supported Markets

### Americas
- **US**: NASDAQ, NYSE, AMEX (symbols like `AAPL`, `MSFT`)
- **Canada**: TSX (symbols like `RY.TO`)
- **Brazil**: BMFBOVESPA (symbols like `VALE3.SA`)
- **Mexico**: BMV (symbols like `ASUR.MX`)
- **Argentina**: BCBA (symbols like `BMA.BA`)

### Europe
- **UK**: LSE (symbols like `BARC.L`)
- **France**: EURONEXT (symbols like `AIR.PA`)
- **Germany**: XETRA (symbols like `SAP.DE`)
- **Sweden**: OMXSTO (symbols like `ERIC-B.ST`)
- **Spain**: BMAD (symbols like `REPSOL.MC`)
- **Italy**: EURONEXT Milan (symbols like `ENI.MI`)
- **Belgium**: EURONEXT (symbols like `GIB.BR`)
- **Denmark**: OMXCOPENHAGEN (symbols like `ISH.CO`)
- **Finland**: OMXHEX (symbols like `NOKIA.HE`)
- **Greece**: ATHEX (symbols like `ETE.ATH`)
- **Ireland**: ISE (symbols like `RY.IR`)
- **Netherlands**: EURONEXT (symbols like `ING.AS`)
- **Norway**: OMXOSLO (symbols like `EQNR.OL`)
- **Poland**: WSE (symbols like `PZU.WA`)
- **Portugal**: EURONEXT (symbols like `BCP.LI`)
- **Switzerland**: SIX (symbols like `NESN.SW`)

### Asia-Pacific
- **Taiwan**: TWSE (symbols like `2330.TW`), TPEX (symbols like `6488.TWO`)
- **Hong Kong**: HKEX (symbols like `0700.HK`)
- **Japan**: TSE (symbols like `7203.T`)
- **South Korea**: KRX (symbols like `005930.KS`), KOSDAQ (symbols like `010000.KQ`)
- **Singapore**: SGX (symbols like `U11.SI`)
- **Australia**: ASX (symbols like `CBA.AX`)
- **New Zealand**: NZX (symbols like `FBU.NZ`)
- **India**: NSE (symbols like `INFY.NS`), BSE (symbols like `INFY.BO`)
- **Thailand**: SET (symbols like `ADVANC.BK`)
- **Malaysia**: KLSE (symbols like `1023.KL`)
- **Philippines**: PSE (symbols like `JFC.PH`)
- **Indonesia**: IDX (symbols like `BBCA.JK`)

### Middle East & Africa
- **Israel**: TASE (symbols like `TEVA.TA`)
- **South Africa**: JSE (symbols like `NPN.JO`)
- **Saudi Arabia**: TASI (limited support)
- **UAE**: ADX (limited support)

## ⚠️ Known Limitations

### Non-stock search

Search also includes a curated catalog with English and Chinese aliases:

| Search | TradingView symbol | Instrument |
| --- | --- | --- |
| VIX | TVC:VIX | S&P 500 volatility index |
| DXY | TVC:DXY | US dollar index |
| US10Y | TVC:US10Y | US ten-year Treasury yield |
| US02Y / US2Y | TVC:US02Y | US two-year Treasury yield |
| USOIL / WTI | TVC:USOIL | WTI crude oil CFD |
| GOLD | TVC:GOLD | Gold CFD |
| BTCUSD / BTC | BITSTAMP:BTCUSD | Bitcoin / US dollar |
| ETHUSD / ETH | BITSTAMP:ETHUSD | Ethereum / US dollar |
| ES / ES1! | CME_MINI:ES1! | E-mini S&P 500 continuous futures |
| NQ / NQ1! | CME_MINI:NQ1! | E-mini Nasdaq 100 continuous futures |

Results use qualified symbols to distinguish them from stock tickers.
Exact aliases rank above incidental name matches; matching stocks remain in
the results (for example, ES can also match Eversource Energy).
These entries remain searchable if Finnhub is unavailable. Charts and the
watchlist use TradingView; company financials and stock sentiment are hidden
for these instruments. Finnhub quotes and price alerts are not added for them.
This is a curated supplement, not a complete search of all TradingView markets;
embedded chart availability still depends on TradingView.

Symbol references: [USOIL](https://www.tradingview.com/symbols/USOIL/?exchange=TVC),
[US10Y](https://www.tradingview.com/symbols/TVC-US10Y/),
[GOLD](https://www.tradingview.com/symbols/GOLD/?exchange=TVC),
[VIX](https://www.tradingview.com/symbols/TVC-VIX/),
[DXY](https://www.tradingview.com/symbols/TVC-DXY/),
[US02Y](https://www.tradingview.com/symbols/TVC-US02Y/),
[BTCUSD](https://www.tradingview.com/symbols/BTCUSD/?exchange=BITSTAMP),
[ETHUSD](https://www.tradingview.com/symbols/ETHUSD/?exchange=BITSTAMP),
[ES](https://www.tradingview.com/symbols/CME_MINI-ES1!/),
[NQ](https://www.tradingview.com/symbols/CME_MINI-NQ1!/).

### TradingView Widget Limitations

TradingView's free tier embeddable widgets have several restrictions:

1. **International Markets**: Some symbols, especially from emerging markets (India NSE, Vietnam, etc.), may show:
   - "This symbol is only available on TradingView" error
   - Missing charts or company profile data
   - Empty technical analysis indicators

2. **Affected Markets**:
   - India (NSE/BSE): Free tier support is limited
   - Vietnam, Philippines, Indonesia: Partial or no support
   - Emerging market stocks: Often require paid subscription

3. **Why This Happens**:
   - TradingView's free widget tier has limited symbol availability
   - Some exchanges require commercial licensing
   - High-volume markets get priority in free tier

### Finnhub API Limitations

1. **Free Tier**:
   - Supports basic quote and company data for most exchanges
   - Real-time data delayed by 15+ minutes for non-US stocks
   - Rate limited to 60 API calls per minute
   - No access to historical minute-level bars

2. **Market-Specific**:
   - India NSE/BSE: Available but with delays
   - Chinese A-shares: Not available in free tier
   - Forex: Not available
   - Cryptocurrencies: Not available

## 🔧 Troubleshooting

### "This symbol is only available on TradingView"

**What this means**: TradingView's embedded widgets don't support this symbol.

**What you can still do**:
- ✅ Search for the stock using Finnhub data
- ✅ View company profile from Finnhub
- ✅ Add to watchlist (data updates available)
- ✅ See market news from Finnhub
- ❌ View interactive TradingView charts
- ❌ See technical analysis indicators from TradingView

**Solutions**:
1. **For Personal Use**: Upgrade to Finnhub/TradingView paid plans
2. **For Self-Hosted Deployments**: 
   - Upgrade API keys in your `.env` file
   - Consider alternative chart libraries (e.g., Lightweight Charts, Chart.js)

### Charts Don't Load

**Possible causes**:
- Symbol not supported on TradingView
- Network connectivity issue
- TradingView API rate limiting

**Troubleshooting**:
1. Check browser console for errors (F12)
2. Verify symbol exists on Finnhub search
3. Try a US stock (e.g., AAPL) to confirm basic functionality
4. Check your internet connection

## 🚀 Future Improvements

The OpenStock community is working on:

- [ ] Fallback chart libraries for unsupported symbols
- [ ] Market availability checker before displaying widgets
- [ ] Alternative data sources for emerging markets
- [ ] Forex support
- [ ] Cryptocurrency support
- [ ] Custom indicators and drawing tools
- [ ] Paper trading features

## 💡 Contributing

If you discover:
- A market that should be supported
- An exchange with incorrect symbol mapping
- Alternative data providers we should consider

Please [open an issue](https://github.com/Open-Dev-Society/OpenStock/issues) with:
- Exchange name and country
- Example stock symbols
- Expected vs. actual behavior
- Links to Finnhub/TradingView documentation

## 📚 References

- [Finnhub API Documentation](https://finnhub.io/docs/api)
- [TradingView Widget Documentation](https://www.tradingview.com/pine-script-docs/)
- [Supported Finnhub Exchanges](https://finnhub.io/docs/api/symbol-lookup)

---

**Disclaimer**: Nothing here is financial advice. Market data availability depends on provider terms and your subscription tier. Always verify current data before making investment decisions. OpenStock is community-built and not a brokerage.
