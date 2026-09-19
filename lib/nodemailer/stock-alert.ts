import { transporter } from '@/lib/nodemailer';

export async function sendStockAlertEmail({ email, symbol, condition, targetPrice, currentPrice }: {
    email: string;
    symbol: string;
    condition: 'ABOVE' | 'BELOW';
    targetPrice: number;
    currentPrice: number;
}) {
    if (!transporter || !process.env.NODEMAILER_EMAIL || !process.env.NODEMAILER_PASSWORD) {
        throw new Error('Email credentials not configured');
    }

    const relation = condition === 'ABOVE' ? 'at or above' : 'at or below';
    // Plain text avoids interpolating stock identifiers into HTML.
    const info = await transporter.sendMail({
        from: `"Openstock" <${process.env.NODEMAILER_EMAIL}>`,
        to: email,
        subject: `Openstock price alert: ${symbol}`,
        text: [
            `Your price alert for ${symbol} has been triggered.`,
            '',
            `Condition: price ${relation} ${targetPrice.toFixed(2)}`,
            `Price observed: ${currentPrice.toFixed(2)}`,
            '',
            'Prices are in the quote currency for this stock.',
            'Prices may have changed since this check. This is a one-time alert.',
            'Open your Openstock watchlist to manage your alerts.',
        ].join('\n'),
    });

    if (!info.accepted?.length) {
        throw new Error('Stock alert email was not accepted by the mail server');
    }
    return { messageId: info.messageId };
}
