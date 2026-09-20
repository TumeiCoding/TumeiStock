import StockDetailsContent from "@/components/stocks/StockDetailsContent";

export default async function StockDetails({ params }: StockDetailsPageProps) {
    const { symbol } = await params;
    return <StockDetailsContent symbol={symbol} />;
}
