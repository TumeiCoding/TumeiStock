import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    find: vi.fn(), findOne: vi.fn(), update: vi.fn(), user: vi.fn(),
    quote: vi.fn(), sendMail: vi.fn(),
}));
vi.mock('@/lib/inngest/client', () => ({
    inngest: { createFunction: (_config: unknown, _trigger: unknown, handler: unknown) => handler },
}));
vi.mock('@/lib/nodemailer', () => ({ transporter: { sendMail: mocks.sendMail } }));
vi.mock('@/lib/actions/user.actions', () => ({}));
vi.mock('@/lib/actions/watchlist.actions', () => ({}));
vi.mock('@/lib/utils', () => ({}));
vi.mock('@/lib/actions/finnhub.actions', () => ({ getQuote: mocks.quote }));
vi.mock('@/database/models/alert.model', () => ({
    Alert: {
        find: () => ({ lean: mocks.find }),
        findOne: () => ({ lean: mocks.findOne }),
        findByIdAndUpdate: mocks.update,
    },
}));
vi.mock('@/database/mongoose', async () => {
    const { default: mongoose } = await import('mongoose');
    return { connectToDatabase: async () => ({
        connection: { db: { collection: () => ({ findOne: mocks.user }) } },
        isObjectIdOrHexString: mongoose.isObjectIdOrHexString,
        Types: mongoose.Types,
    }) };
});

import { checkStockAlerts } from '@/lib/inngest/functions';
import { sendStockAlertEmail } from '@/lib/nodemailer/stock-alert';

const alert = {
    _id: 'alert-1', userId: '507f1f77bcf86cd799439011', symbol: 'AAPL',
    condition: 'ABOVE' as const, targetPrice: 200,
};
// Cache successful steps to model Inngest replay after a failed step.
function runner() {
    const cache = new Map<string, unknown>();
    const step = { run: async (id: string, fn: () => Promise<unknown>) => {
        if (cache.has(id)) return cache.get(id);
        const result = await fn();
        cache.set(id, result);
        return result;
    } };
    return () => (checkStockAlerts as unknown as (args: { step: typeof step }) => Promise<unknown>)({ step });
}

describe('stock alert delivery', () => {
    afterEach(() => vi.unstubAllEnvs());

    beforeEach(() => {
        vi.resetAllMocks();
        vi.stubEnv('NODEMAILER_EMAIL', 'sender@example.com');
        vi.stubEnv('NODEMAILER_PASSWORD', 'test-password');
        mocks.find.mockResolvedValue([alert]);
        mocks.findOne.mockResolvedValue(alert);
        mocks.user.mockResolvedValue({ email: 'owner@example.com' });
        mocks.quote.mockResolvedValue({ c: 200 });
        mocks.sendMail.mockResolvedValue({ accepted: ['owner@example.com'], messageId: 'mail-1' });
        mocks.update.mockResolvedValue({});
    });

    it('sends to the alert owner at the inclusive threshold, then deactivates it', async () => {
        await runner()();
        expect(mocks.user.mock.calls[0][0].$or[2]._id.toHexString()).toBe(alert.userId);
        expect(mocks.sendMail).toHaveBeenCalledWith(expect.objectContaining({
            to: 'owner@example.com', text: expect.stringContaining('Price observed: 200.00'),
        }));
        expect(mocks.update).toHaveBeenCalledWith('alert-1', { triggered: true, active: false });
        expect(mocks.sendMail.mock.invocationCallOrder[0]).toBeLessThan(mocks.update.mock.invocationCallOrder[0]);
    });

    it('also supports the BELOW condition', async () => {
        const below = { ...alert, condition: 'BELOW' };
        mocks.find.mockResolvedValue([below]);
        mocks.findOne.mockResolvedValue(below);
        await runner()();
        expect(mocks.sendMail).toHaveBeenCalledWith(expect.objectContaining({ text: expect.stringContaining('at or below 200.00') }));
    });

    it('does not fetch quotes when there are no eligible alerts', async () => {
        mocks.find.mockResolvedValue([]);
        await runner()();
        expect(mocks.quote).not.toHaveBeenCalled();
        expect(mocks.sendMail).not.toHaveBeenCalled();
    });

    it('does not send below the ABOVE threshold', async () => {
        mocks.quote.mockResolvedValue({ c: 199 });
        await runner()();
        expect(mocks.sendMail).not.toHaveBeenCalled();
    });

    it('skips alerts deleted or deactivated since the initial check', async () => {
        mocks.findOne.mockResolvedValue(null);
        await runner()();
        expect(mocks.sendMail).not.toHaveBeenCalled();
        expect(mocks.update).not.toHaveBeenCalled();
    });

    it('leaves the alert active when delivery fails, and retries delivery', async () => {
        mocks.sendMail.mockRejectedValueOnce(new Error('SMTP unavailable'));
        const run = runner();
        await expect(run()).rejects.toThrow('SMTP unavailable');
        expect(mocks.update).not.toHaveBeenCalled();
        await run();
        expect(mocks.sendMail).toHaveBeenCalledTimes(2);
        expect(mocks.update).toHaveBeenCalledTimes(1);
    });

    it('does not resend a successful email when the database update is retried', async () => {
        mocks.update.mockRejectedValueOnce(new Error('DB unavailable'));
        const run = runner();
        await expect(run()).rejects.toThrow('DB unavailable');
        await run();
        expect(mocks.sendMail).toHaveBeenCalledTimes(1);
        expect(mocks.update).toHaveBeenCalledTimes(2);
    });

    it('does not deactivate an alert whose owner cannot be found', async () => {
        mocks.user.mockResolvedValue(null);
        await expect(runner()()).rejects.toThrow('Recipient not found');
        expect(mocks.sendMail).not.toHaveBeenCalled();
        expect(mocks.update).not.toHaveBeenCalled();
    });

    it('requires SMTP acceptance before marking the alert triggered', async () => {
        mocks.sendMail.mockResolvedValue({ accepted: [], messageId: 'mail-1' });
        await expect(runner()()).rejects.toThrow('not accepted');
        expect(mocks.update).not.toHaveBeenCalled();
    });

    it('fails explicitly when email credentials are missing', async () => {
        vi.stubEnv('NODEMAILER_PASSWORD', '');
        await expect(sendStockAlertEmail({ ...alert, email: 'owner@example.com', currentPrice: 201 }))
            .rejects.toThrow('Email credentials not configured');
        expect(mocks.sendMail).not.toHaveBeenCalled();
    });
});
