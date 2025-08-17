import { z } from "zod";
import { createTRPCRouter, orgProtectedProcedure } from "~/server/api/trpc";

export const dashboardRouter = createTRPCRouter({
  /**
   * Get dashboard statistics for the organization
   */
  getStats: orgProtectedProcedure.query(async ({ ctx }) => {
    const { db, orgId } = ctx;

    // Get organization to ensure it exists
    const organization = await db.organization.findUnique({
      where: { clerkOrgId: orgId },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    // Calculate date ranges
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Get stats in parallel
    const [
      totalCustomers,
      totalJobsCompleted,
      currentMonthRevenue,
      lastMonthRevenue,
      pendingInvoices,
      todayJobs,
      overdueInvoices,
    ] = await Promise.all([
      // Total customers
      db.customer.count({
        where: { organizationId: organization.id },
      }),

      // Total completed jobs
      db.job.count({
        where: {
          organizationId: organization.id,
          status: "completed",
        },
      }),

      // Current month revenue (paid invoices)
      db.invoice.aggregate({
        where: {
          organizationId: organization.id,
          status: "paid",
          paymentDate: {
            gte: startOfMonth,
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // Last month revenue
      db.invoice.aggregate({
        where: {
          organizationId: organization.id,
          status: "paid",
          paymentDate: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // Pending invoices count
      db.invoice.count({
        where: {
          organizationId: organization.id,
          status: { in: ["draft", "sent"] },
        },
      }),

      // Today's jobs count
      db.job.count({
        where: {
          organizationId: organization.id,
          scheduledAt: {
            gte: startOfToday,
            lt: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Overdue invoices count
      db.invoice.count({
        where: {
          organizationId: organization.id,
          status: "sent",
          dueDate: {
            lt: today,
          },
        },
      }),
    ]);

    // Calculate month-over-month growth
    const currentRevenue = currentMonthRevenue._sum.totalAmount?.toNumber() || 0;
    const lastRevenue = lastMonthRevenue._sum.totalAmount?.toNumber() || 0;
    const revenueGrowth = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

    return {
      totalCustomers,
      totalJobsCompleted,
      currentMonthRevenue: currentRevenue,
      revenueGrowth,
      pendingInvoices,
      todayJobs,
      overdueInvoices,
      lastMonthRevenue: lastRevenue,
    };
  }),

  /**
   * Get today's jobs with customer details
   */
  getTodayJobs: orgProtectedProcedure.query(async ({ ctx }) => {
    const { db, orgId } = ctx;

    const organization = await db.organization.findUnique({
      where: { clerkOrgId: orgId },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    const todayJobs = await db.job.findMany({
      where: {
        organizationId: organization.id,
        scheduledAt: {
          gte: startOfToday,
          lt: endOfToday,
        },
      },
      include: {
        customer: true,
        plumber: true,
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });

    return todayJobs.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      jobType: job.jobType,
      priority: job.priority,
      status: job.status,
      scheduledAt: job.scheduledAt,
      startTime: job.startTime,
      duration: job.duration,
      address: job.address,
      postalCode: job.postalCode,
      city: job.city,
      customer: job.customer ? {
        id: job.customer.id,
        name: job.customer.name,
        phone: job.customer.phone,
        email: job.customer.email,
      } : null,
      plumber: {
        id: job.plumber.id,
        firstName: job.plumber.firstName,
        lastName: job.plumber.lastName,
        companyName: job.plumber.companyName,
      },
    }));
  }),

  /**
   * Get recent activity (last 10 actions across jobs, invoices, customers)
   */
  getRecentActivity: orgProtectedProcedure.query(async ({ ctx }) => {
    const { db, orgId } = ctx;

    const organization = await db.organization.findUnique({
      where: { clerkOrgId: orgId },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    // Get recent activities from different tables
    const [recentJobs, recentInvoices, recentCustomers] = await Promise.all([
      // Recent jobs (last 5)
      db.job.findMany({
        where: { organizationId: organization.id },
        include: {
          customer: true,
          plumber: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),

      // Recent invoices (last 5)
      db.invoice.findMany({
        where: { organizationId: organization.id },
        include: {
          customer: true,
          plumber: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),

      // Recent customers (last 5)
      db.customer.findMany({
        where: { organizationId: organization.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    // Combine and format activity items
    const activities = [
      ...recentJobs.map((job) => ({
        id: `job-${job.id}`,
        type: "job" as const,
        action: job.status === "completed" ? "completed" : job.status === "in_progress" ? "started" : "scheduled",
        title: job.title,
        description: `${job.jobType} for ${job.customer?.name || "Unknown Customer"}`,
        timestamp: job.updatedAt,
        status: job.status,
        priority: job.priority,
        customer: job.customer?.name,
        plumber: `${job.plumber.firstName} ${job.plumber.lastName}`,
      })),

      ...recentInvoices.map((invoice) => ({
        id: `invoice-${invoice.id}`,
        type: "invoice" as const,
        action: invoice.status === "paid" ? "paid" : invoice.status === "sent" ? "sent" : "created",
        title: `Invoice ${invoice.invoiceNumber}`,
        description: `€${invoice.totalAmount.toNumber()} for ${invoice.customer?.name || "Unknown Customer"}`,
        timestamp: invoice.updatedAt,
        status: invoice.status,
        amount: invoice.totalAmount.toNumber(),
        customer: invoice.customer?.name,
        plumber: `${invoice.plumber.firstName} ${invoice.plumber.lastName}`,
      })),

      ...recentCustomers.map((customer) => ({
        id: `customer-${customer.id}`,
        type: "customer" as const,
        action: "created",
        title: `New Customer: ${customer.name}`,
        description: `Added ${customer.customerType} customer in ${customer.city || "Unknown City"}`,
        timestamp: customer.createdAt,
        customerType: customer.customerType,
        city: customer.city,
        phone: customer.phone,
      })),
    ];

    // Sort by timestamp and take the most recent 10
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  }),

  /**
   * Get quick actions data (jobs ready for invoicing, urgent jobs, etc.)
   */
  getQuickActions: orgProtectedProcedure.query(async ({ ctx }) => {
    const { db, orgId } = ctx;

    const organization = await db.organization.findUnique({
      where: { clerkOrgId: orgId },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    const today = new Date();

    const [
      completedJobsWithoutInvoice,
      urgentJobs,
      overdueInvoices,
      todayScheduledJobs,
    ] = await Promise.all([
      // Completed jobs without invoice
      db.job.findMany({
        where: {
          organizationId: organization.id,
          status: "completed",
          invoices: {
            none: {},
          },
        },
        include: {
          customer: true,
        },
        take: 5,
      }),

      // Urgent/emergency jobs
      db.job.findMany({
        where: {
          organizationId: organization.id,
          priority: { in: ["high", "emergency"] },
          status: { not: "completed" },
        },
        include: {
          customer: true,
        },
        orderBy: {
          scheduledAt: "asc",
        },
        take: 5,
      }),

      // Overdue invoices
      db.invoice.findMany({
        where: {
          organizationId: organization.id,
          status: "sent",
          dueDate: {
            lt: today,
          },
        },
        include: {
          customer: true,
        },
        orderBy: {
          dueDate: "asc",
        },
        take: 5,
      }),

      // Today's scheduled jobs
      db.job.count({
        where: {
          organizationId: organization.id,
          scheduledAt: {
            gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
          },
          status: { not: "completed" },
        },
      }),
    ]);

    return {
      completedJobsWithoutInvoice: completedJobsWithoutInvoice.length,
      urgentJobs: urgentJobs.length,
      overdueInvoices: overdueInvoices.length,
      todayScheduledJobs,
      completedJobsDetails: completedJobsWithoutInvoice.map((job) => ({
        id: job.id,
        title: job.title,
        customer: job.customer?.name,
        completedAt: job.completedAt,
      })),
      urgentJobsDetails: urgentJobs.map((job) => ({
        id: job.id,
        title: job.title,
        priority: job.priority,
        scheduledAt: job.scheduledAt,
        customer: job.customer?.name,
      })),
      overdueInvoicesDetails: overdueInvoices.map((invoice) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount.toNumber(),
        dueDate: invoice.dueDate,
        customer: invoice.customer?.name,
      })),
    };
  }),

  /**
   * Get revenue chart data for the last 12 months
   */
  getRevenueChart: orgProtectedProcedure.query(async ({ ctx }) => {
    const { db, orgId } = ctx;

    const organization = await db.organization.findUnique({
      where: { clerkOrgId: orgId },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    const today = new Date();
    const twelveMonthsAgo = new Date(today.getFullYear() - 1, today.getMonth(), 1);

    // Get monthly revenue data
    const monthlyRevenue = await db.invoice.groupBy({
      by: ['invoiceDate'],
      where: {
        organizationId: organization.id,
        status: 'paid',
        paymentDate: {
          gte: twelveMonthsAgo,
        },
      },
      _sum: {
        totalAmount: true,
      },
      orderBy: {
        invoiceDate: 'asc',
      },
    });

    // Group by month and format for chart
    const monthlyData: Record<string, number> = {};
    
    monthlyRevenue.forEach((item) => {
      const date = new Date(item.invoiceDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (item._sum.totalAmount?.toNumber() || 0);
    });

    // Generate array of last 12 months
    const chartData = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' });
      
      chartData.push({
        month: monthName,
        revenue: monthlyData[monthKey] || 0,
      });
    }

    return chartData;
  }),
});