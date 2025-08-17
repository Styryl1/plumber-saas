import { createTRPCRouter } from "~/server/api/trpc";
import { jobsRouter } from "~/server/api/routers/jobs";
import { customersRouter } from "~/server/api/routers/customers";
import { invoicesRouter } from "~/server/api/routers/invoices";
import { dashboardRouter } from "~/server/api/routers/dashboard";
import { widgetRouter } from "~/server/api/routers/widget";
import { chatRouter } from "~/server/api/routers/chat";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  dashboard: dashboardRouter,
  jobs: jobsRouter,
  customers: customersRouter,
  invoices: invoicesRouter,
  widget: widgetRouter,
  chat: chatRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;