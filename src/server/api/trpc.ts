/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import { type NextRequest } from "next/server";
import { type Session } from "next-auth";
import superjson from "superjson";
import { ZodError } from "zod";
import { getAuth } from "@clerk/nextjs/server";

import { db } from "~/server/db";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

interface CreateContextOptions {
  session: Session | null;
  userId: string | null;
  orgId: string | null;
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    userId: opts.userId,
    orgId: opts.orgId,
    db,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: { req?: NextRequest } = {}) => {
  // Always provide a fallback context for public procedures
  const fallbackContext = {
    session: null,
    userId: null,
    orgId: null,
  };

  // Handle missing request object
  if (!opts.req) {
    console.warn("tRPC context: No request object provided, using public context");
    return createInnerTRPCContext(fallbackContext);
  }

  const req = opts.req;

  try {
    // For widget routes, always use public context (no auth needed)
    const url = new URL(req.url);
    const isWidgetRoute = url.pathname.includes('/widget.');
    
    if (isWidgetRoute) {
      console.log("Widget route detected, using public context");
      return createInnerTRPCContext(fallbackContext);
    }

    // For other routes, try to get Clerk auth info
    const auth = getAuth(req);
    const userId = auth?.userId || null;
    const orgId = auth?.orgId || null;

    return createInnerTRPCContext({
      session: null, // We're using Clerk instead of NextAuth
      userId,
      orgId,
    });
  } catch (error) {
    // Fallback for all procedures when auth fails
    console.warn("Auth failed, using public context:", error);
    return createInnerTRPCContext(fallbackContext);
  }
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

/** Reusable middleware that enforces users are logged in before running the procedure. */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      // infers the `userId` as non-nullable
      userId: ctx.userId,
      orgId: ctx.orgId,
    },
  });
});

/**
 * Protected procedure
 **/
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

/** Middleware that enforces users are in an organization */
const enforceUserInOrg = t.middleware(({ ctx, next }) => {
  if (!ctx.userId || !ctx.orgId) {
    throw new TRPCError({ 
      code: "UNAUTHORIZED",
      message: "Must be in an organization to access this resource" 
    });
  }

  return next({
    ctx: {
      userId: ctx.userId,
      orgId: ctx.orgId,
    },
  });
});

/**
 * Organization-protected procedure
 **/
export const orgProtectedProcedure = t.procedure.use(enforceUserInOrg);