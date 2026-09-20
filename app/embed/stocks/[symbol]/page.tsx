import StockDetailsContent from "@/components/stocks/StockDetailsContent";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function EmbeddedStockDetails({ params }: StockDetailsPageProps) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect("/sign-in");

    const { symbol } = await params;
    return <StockDetailsContent symbol={symbol} />;
}
