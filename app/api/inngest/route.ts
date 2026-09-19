import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { sendSignUpEmail, checkStockAlerts, checkInactiveUsers } from "@/lib/inngest/functions";

export const { GET, POST, PUT } = serve({
    client: inngest,
    // Weekly news broadcasts are disabled: do not register sendWeeklyNewsSummary.
    functions: [sendSignUpEmail, checkStockAlerts, checkInactiveUsers],
})
