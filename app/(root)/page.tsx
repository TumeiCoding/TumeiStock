import TradingViewWidget from "@/components/TradingViewWidget";
import { HEATMAP_WIDGET_CONFIG } from "@/lib/constants";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserWatchlist } from "@/lib/actions/watchlist.actions";
import WatchlistStockNav from "@/components/watchlist/WatchlistStockNav";

const Home = async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect('/sign-in');
    const watchlist = await getUserWatchlist(session.user.id);

    const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

    return (
        <div className="flex min-h-screen flex-col gap-8 home-wrapper">
            <WatchlistStockNav items={watchlist} />
            <section className="w-full">
                <TradingViewWidget
                    title="Stock Heatmap"
                    scriptUrl={`${scriptUrl}stock-heatmap.js`}
                    config={HEATMAP_WIDGET_CONFIG}
                    height={600}
                />
            </section>
        </div>
    )
}

export default Home;
