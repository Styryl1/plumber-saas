import { z } from "zod";
import { createTRPCRouter, orgProtectedProcedure } from "~/server/api/trpc";

// Zod schemas for input validation
const createCustomerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(1, "Phone number is required"),
  streetAddress: z.string().optional(),
  postalCode: z.string().regex(/^\d{4}\s?[A-Z]{2}$/i, "Invalid Dutch postal code format").optional(),
  city: z.string().optional(),
  customerType: z.enum(["residential", "commercial"]).default("residential"),
  preferredContact: z.enum(["phone", "email", "whatsapp"]).default("phone"),
  notes: z.string().optional(),
});

const updateCustomerSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  streetAddress: z.string().optional(),
  postalCode: z.string().regex(/^\d{4}\s?[A-Z]{2}$/i, "Invalid Dutch postal code format").optional(),
  city: z.string().optional(),
  customerType: z.enum(["residential", "commercial"]).optional(),
  preferredContact: z.enum(["phone", "email", "whatsapp"]).optional(),
  notes: z.string().optional(),
});

const customerFiltersSchema = z.object({
  customerType: z.enum(["residential", "commercial"]).optional(),
  city: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["name", "totalJobs", "totalSpent", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const customersRouter = createTRPCRouter({
  /**
   * Get customers with filtering, search, and pagination
   */
  list: orgProtectedProcedure
    .input(customerFiltersSchema)
    .query(async ({ ctx, input }) => {
      const { db, orgId } = ctx;

      const organization = await db.organization.findUnique({
        where: { clerkOrgId: orgId },
      });

      if (!organization) {
        throw new Error("Organization not found");
      }

      // Build where clause
      const where: any = {
        organizationId: organization.id,
      };

      // Apply filters
      if (input.customerType) where.customerType = input.customerType;
      if (input.city) where.city = { contains: input.city, mode: "insensitive" };

      // Search filter
      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          { email: { contains: input.search, mode: "insensitive" } },
          { phone: { contains: input.search, mode: "insensitive" } },
          { streetAddress: { contains: input.search, mode: "insensitive" } },
          { postalCode: { contains: input.search, mode: "insensitive" } },
          { city: { contains: input.search, mode: "insensitive" } },
        ];
      }

      // Get total count for pagination
      const total = await db.customer.count({ where });

      // Determine sort order
      const orderBy: any = {};
      orderBy[input.sortBy] = input.sortOrder;

      // Get customers with pagination
      const customers = await db.customer.findMany({
        where,
        include: {
          jobs: {
            select: {
              id: true,
              status: true,
              scheduledAt: true,
              completedAt: true,
              laborHours: true,
              hourlyRate: true,
              materialsCost: true,
            },
          },
          invoices: {
            select: {
              id: true,
              status: true,
              totalAmount: true,
              paymentDate: true,
            },
          },
        },
        orderBy,
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      });

      return {
        customers: customers.map((customer) => {
          // Calculate stats
          const completedJobs = customer.jobs.filter(job => job.status === "completed");
          const totalRevenue = customer.invoices
            .filter(inv => inv.status === "paid")
            .reduce((sum, inv) => sum + inv.totalAmount.toNumber(), 0);
          
          const lastJobDate = customer.jobs
            .filter(job => job.completedAt)
            .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))[0]?.completedAt;

          const pendingInvoices = customer.invoices.filter(inv => 
            inv.status === "sent" || inv.status === "draft"
          ).length;

          return {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            streetAddress: customer.streetAddress,
            postalCode: customer.postalCode,
            city: customer.city,
            customerType: customer.customerType,
            preferredContact: customer.preferredContact,
            notes: customer.notes,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt,
            // Calculated stats
            totalJobs: customer.jobs.length,
            completedJobs: completedJobs.length,
            totalSpent: totalRevenue,
            lastJobDate,
            pendingInvoices,
            // Status indicators
            isRecentCustomer: customer.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            hasActiveJobs: customer.jobs.some(job => 
              job.status === "scheduled" || job.status === "in_progress"
            ),
          };
        }),
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          pages: Math.ceil(total / input.limit),
        },
      };
    }),

  /**
   * Get customer by ID with full details
   */
  byId: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, orgId } = ctx;

      const organization = await db.organization.findUnique({
        where: { clerkOrgId: orgId },
      });

      if (!organization) {
        throw new Error("Organization not found");
      }

      const customer = await db.customer.findUnique({
        where: {
          id: input.id,
          organizationId: organization.id,
        },
        include: {
          jobs: {
            include: {
              plumber: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  companyName: true,
                },
              },
            },
            orderBy: { scheduledAt: "desc" },
          },
          invoices: {
            orderBy: { invoiceDate: "desc" },
          },
        },
      });

      if (!customer) {
        throw new Error("Customer not found");
      }

      // Calculate detailed stats
      const completedJobs = customer.jobs.filter(job => job.status === "completed");
      const totalRevenue = customer.invoices
        .filter(inv => inv.status === "paid")
        .reduce((sum, inv) => sum + inv.totalAmount.toNumber(), 0);
      
      const pendingInvoiceAmount = customer.invoices
        .filter(inv => inv.status === "sent" || inv.status === "draft")
        .reduce((sum, inv) => sum + inv.totalAmount.toNumber(), 0);

      const averageJobValue = completedJobs.length > 0 
        ? totalRevenue / completedJobs.length 
        : 0;

      const lastJobDate = customer.jobs
        .filter(job => job.completedAt)
        .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))[0]?.completedAt;

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        streetAddress: customer.streetAddress,
        postalCode: customer.postalCode,
        city: customer.city,
        customerType: customer.customerType,
        preferredContact: customer.preferredContact,
        notes: customer.notes,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        // Detailed stats
        totalJobs: customer.jobs.length,
        completedJobs: completedJobs.length,
        totalSpent: totalRevenue,
        pendingInvoiceAmount,
        averageJobValue,
        lastJobDate,
        // Job details
        jobs: customer.jobs.map((job) => ({
          id: job.id,
          title: job.title,
          jobType: job.jobType,
          priority: job.priority,
          status: job.status,
          scheduledAt: job.scheduledAt,
          completedAt: job.completedAt,
          laborHours: job.laborHours?.toNumber(),
          hourlyRate: job.hourlyRate?.toNumber(),
          materialsCost: job.materialsCost?.toNumber(),
          plumber: {
            id: job.plumber.id,
            name: `${job.plumber.firstName} ${job.plumber.lastName}`,
            companyName: job.plumber.companyName,
          },
        })),
        // Invoice details
        invoices: customer.invoices.map((invoice) => ({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: invoice.invoiceDate,
          dueDate: invoice.dueDate,
          status: invoice.status,
          totalAmount: invoice.totalAmount.toNumber(),
          paymentDate: invoice.paymentDate,
        })),
      };
    }),

  /**
   * Create a new customer
   */
  create: orgProtectedProcedure
    .input(createCustomerSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, orgId } = ctx;

      const organization = await db.organization.findUnique({
        where: { clerkOrgId: orgId },
      });

      if (!organization) {
        throw new Error("Organization not found");
      }

      // Check if customer with same phone already exists
      const existingCustomer = await db.customer.findFirst({
        where: {
          organizationId: organization.id,
          phone: input.phone,
        },
      });

      if (existingCustomer) {
        throw new Error("Customer with this phone number already exists");
      }

      // Format postal code to standard Dutch format (4 digits space 2 letters)
      let formattedPostalCode = input.postalCode;
      if (formattedPostalCode) {
        formattedPostalCode = formattedPostalCode.replace(/\s/g, "").toUpperCase();
        if (formattedPostalCode.length === 6) {
          formattedPostalCode = `${formattedPostalCode.slice(0, 4)} ${formattedPostalCode.slice(4)}`;
        }
      }

      const customer = await db.customer.create({
        data: {
          organizationId: organization.id,
          name: input.name,
          email: input.email || null,
          phone: input.phone,
          streetAddress: input.streetAddress,
          postalCode: formattedPostalCode,
          city: input.city,
          customerType: input.customerType,
          preferredContact: input.preferredContact,
          notes: input.notes,
        },
      });

      return {
        success: true,
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          city: customer.city,
          customerType: customer.customerType,
        },
      };
    }),

  /**
   * Update a customer
   */
  update: orgProtectedProcedure
    .input(updateCustomerSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, orgId } = ctx;

      const organization = await db.organization.findUnique({
        where: { clerkOrgId: orgId },
      });

      if (!organization) {
        throw new Error("Organization not found");
      }

      // Verify customer exists and belongs to organization
      const existingCustomer = await db.customer.findUnique({
        where: {
          id: input.id,
          organizationId: organization.id,
        },
      });

      if (!existingCustomer) {
        throw new Error("Customer not found");
      }

      // If updating phone, check for conflicts
      if (input.phone && input.phone !== existingCustomer.phone) {
        const phoneConflict = await db.customer.findFirst({
          where: {
            organizationId: organization.id,
            phone: input.phone,
            id: { not: input.id },
          },
        });

        if (phoneConflict) {
          throw new Error("Another customer with this phone number already exists");
        }
      }

      // Prepare update data
      const updateData: any = {};
      
      Object.keys(input).forEach((key) => {
        if (key !== "id" && input[key as keyof typeof input] !== undefined) {
          updateData[key] = input[key as keyof typeof input];
        }
      });

      // Format postal code if provided
      if (updateData.postalCode) {
        updateData.postalCode = updateData.postalCode.replace(/\s/g, "").toUpperCase();
        if (updateData.postalCode.length === 6) {
          updateData.postalCode = `${updateData.postalCode.slice(0, 4)} ${updateData.postalCode.slice(4)}`;
        }
      }

      const updatedCustomer = await db.customer.update({
        where: { id: input.id },
        data: updateData,
      });

      return {
        success: true,
        customer: {
          id: updatedCustomer.id,
          name: updatedCustomer.name,
          phone: updatedCustomer.phone,
          email: updatedCustomer.email,
          city: updatedCustomer.city,
          customerType: updatedCustomer.customerType,
        },
      };
    }),

  /**
   * Delete a customer
   */
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, orgId } = ctx;

      const organization = await db.organization.findUnique({
        where: { clerkOrgId: orgId },
      });

      if (!organization) {
        throw new Error("Organization not found");
      }

      // Verify customer exists and belongs to organization
      const existingCustomer = await db.customer.findUnique({
        where: {
          id: input.id,
          organizationId: organization.id,
        },
        include: {
          jobs: true,
          invoices: true,
        },
      });

      if (!existingCustomer) {
        throw new Error("Customer not found");
      }

      // Prevent deletion if customer has jobs or invoices
      if (existingCustomer.jobs.length > 0) {
        throw new Error("Cannot delete customer with existing jobs. Archive jobs first.");
      }

      if (existingCustomer.invoices.length > 0) {
        throw new Error("Cannot delete customer with existing invoices.");
      }

      await db.customer.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Search customers for quick selection (autocomplete)
   */
  search: orgProtectedProcedure
    .input(z.object({ 
      query: z.string().min(1),
      limit: z.number().int().positive().max(20).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { db, orgId } = ctx;

      const organization = await db.organization.findUnique({
        where: { clerkOrgId: orgId },
      });

      if (!organization) {
        throw new Error("Organization not found");
      }

      const customers = await db.customer.findMany({
        where: {
          organizationId: organization.id,
          OR: [
            { name: { contains: input.query, mode: "insensitive" } },
            { phone: { contains: input.query, mode: "insensitive" } },
            { email: { contains: input.query, mode: "insensitive" } },
            { city: { contains: input.query, mode: "insensitive" } },
            { postalCode: { contains: input.query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          streetAddress: true,
          postalCode: true,
          city: true,
          customerType: true,
          totalJobs: true,
        },
        orderBy: { name: "asc" },
        take: input.limit,
      });

      return customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.streetAddress,
        postalCode: customer.postalCode,
        city: customer.city,
        customerType: customer.customerType,
        totalJobs: customer.totalJobs,
        displayText: `${customer.name} - ${customer.phone} (${customer.city || "No city"})`,
      }));
    }),

  /**
   * Get customer statistics for dashboard
   */
  stats: orgProtectedProcedure.query(async ({ ctx }) => {
    const { db, orgId } = ctx;

    const organization = await db.organization.findUnique({
      where: { clerkOrgId: orgId },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalCustomers,
      newCustomersThisMonth,
      customersByType,
      topCustomersByRevenue,
    ] = await Promise.all([
      // Total customers
      db.customer.count({
        where: { organizationId: organization.id },
      }),

      // New customers this month
      db.customer.count({
        where: {
          organizationId: organization.id,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),

      // Customers by type
      db.customer.groupBy({
        by: ["customerType"],
        where: { organizationId: organization.id },
        _count: { id: true },
      }),

      // Top customers by revenue
      db.customer.findMany({
        where: { organizationId: organization.id },
        include: {
          invoices: {
            where: { status: "paid" },
            select: { totalAmount: true },
          },
        },
        take: 5,
      }),
    ]);

    // Calculate top customers by revenue
    const customersWithRevenue = topCustomersByRevenue
      .map((customer) => ({
        id: customer.id,
        name: customer.name,
        customerType: customer.customerType,
        totalRevenue: customer.invoices.reduce(
          (sum, inv) => sum + inv.totalAmount.toNumber(),
          0
        ),
      }))
      .filter((customer) => customer.totalRevenue > 0)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    return {
      totalCustomers,
      newCustomersThisMonth,
      customersByType: customersByType.map((item) => ({
        type: item.customerType,
        count: item._count.id,
      })),
      topCustomers: customersWithRevenue,
    };
  }),

  /**
   * Get customer's full address for jobs/invoices
   */
  address: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, orgId } = ctx;

      const organization = await db.organization.findUnique({
        where: { clerkOrgId: orgId },
      });

      if (!organization) {
        throw new Error("Organization not found");
      }

      const customer = await db.customer.findUnique({
        where: {
          id: input.id,
          organizationId: organization.id,
        },
        select: {
          id: true,
          name: true,
          streetAddress: true,
          postalCode: true,
          city: true,
          phone: true,
          email: true,
        },
      });

      if (!customer) {
        throw new Error("Customer not found");
      }

      return {
        id: customer.id,
        name: customer.name,
        streetAddress: customer.streetAddress,
        postalCode: customer.postalCode,
        city: customer.city,
        phone: customer.phone,
        email: customer.email,
        fullAddress: [
          customer.streetAddress,
          customer.postalCode && customer.city ? `${customer.postalCode} ${customer.city}` : customer.city,
        ]
          .filter(Boolean)
          .join(", "),
      };
    }),
});