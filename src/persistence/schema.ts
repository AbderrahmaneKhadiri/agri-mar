import { relations } from "drizzle-orm";
import { boolean, pgEnum, pgTable, text, timestamp, uuid, decimal, integer, jsonb } from "drizzle-orm/pg-core";

// --- ENUMS ---
export const userRoleEnum = pgEnum("user_role", ["ADMIN", "FARMER", "COMPANY"]);
export const connectionStatusEnum = pgEnum("connection_status", ["PENDING", "ACCEPTED", "REJECTED"]);
export const connectionInitiatorEnum = pgEnum("connection_initiator", ["FARMER", "COMPANY"]);
export const quoteStatusEnum = pgEnum("quote_status", ["PENDING", "ACCEPTED", "DECLINED", "NEGOTIATING"]);
export const orderStatusEnum = pgEnum("order_status", ["DRAFT", "SIGNED", "DELIVERED", "PAID", "CANCELLED"]);
export const marketTypeEnum = pgEnum("market_type", ["LOCAL", "INTERNATIONAL", "BOTH"]);
export const notificationTypeEnum = pgEnum("notification_type", ["CONNECTION_REQUEST", "NEW_MESSAGE", "CONNECTION_ACCEPTED", "NEW_QUOTE", "QUOTE_ACCEPTED"]);

// --- USERS (Managed by Better-Auth) ---
export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    image: text("image"),
    role: userRoleEnum("role").default("FARMER").notNull(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull()
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at")
});

// --- FARMER PROFILES (1:1 with users) ---
export const farmerProfiles = pgTable("farmer_profiles", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => user.id, { onDelete: 'cascade' }).notNull().unique(),

    // Informations générales
    fullName: text("full_name").notNull(),
    farmName: text("farm_name").notNull(),
    avatarUrl: text("avatar_url"),
    city: text("city").notNull(),
    region: text("region").notNull(),
    phone: text("phone").notNull(),
    businessEmail: text("business_email").notNull(),

    // Informations sur l'exploitation
    totalAreaHectares: decimal("total_area_hectares").notNull(),
    cropTypes: jsonb("crop_types").notNull().$type<string[]>(),
    livestockType: text("livestock_type"),
    avgAnnualProduction: text("avg_annual_production").notNull(),
    certifications: jsonb("certifications").notNull().$type<string[]>(),
    farmingMethods: jsonb("farming_methods").notNull().$type<string[]>(),

    // Capacité et disponibilité
    availableProductionVolume: text("available_production_volume").notNull(),
    seasonAvailability: jsonb("season_availability").notNull().$type<string[]>(),
    exportCapacity: boolean("export_capacity").default(false).notNull(),
    logisticsCapacity: boolean("logistics_capacity").default(false).notNull(),
    longTermContractAvailable: boolean("long_term_contract_available").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- COMPANY PROFILES (1:1 with users) ---
export const companyProfiles = pgTable("company_profiles", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => user.id, { onDelete: 'cascade' }).notNull().unique(),

    // Informations générales
    companyName: text("company_name").notNull(),
    logoUrl: text("logo_url"),
    industry: text("industry").notNull(),
    establishedYear: integer("established_year").notNull(),
    city: text("city").notNull(),
    country: text("country").notNull(),
    phone: text("phone").notNull(),
    businessEmail: text("business_email").notNull(),
    website: text("website"),

    // Activité principale
    desiredProducts: jsonb("desired_products").notNull().$type<string[]>(),
    avgDesiredQuantity: text("avg_desired_quantity").notNull(),
    targetRegions: jsonb("target_regions").notNull().$type<string[]>(),
    partnershipType: text("partnership_type").notNull(),

    // Marché et capacité
    marketType: marketTypeEnum("market_type").notNull(),
    exportCountries: jsonb("export_countries").notNull().$type<string[]>(),
    requiredCertifications: jsonb("required_certifications").notNull().$type<string[]>(),
    purchasingCapacity: text("purchasing_capacity").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- CONNECTIONS (Networking Many-to-Many) ---
export const connections = pgTable("connections", {
    id: uuid("id").primaryKey().defaultRandom(),
    farmerId: uuid("farmer_id").references(() => farmerProfiles.id, { onDelete: 'cascade' }).notNull(),
    companyId: uuid("company_id").references(() => companyProfiles.id, { onDelete: 'cascade' }).notNull(),
    status: connectionStatusEnum("status").default("PENDING").notNull(),
    initiatedBy: connectionInitiatorEnum("initiated_by").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ---- [x] Phase 4: Professional Networking & Profiling
// - [ ] Phase 5: Messaging & Advanced Discovery

// --- MESSAGES (Tied to connections) ---
export const messages = pgTable("messages", {
    id: uuid("id").primaryKey().defaultRandom(),
    connectionId: uuid("connection_id").references(() => connections.id, { onDelete: 'cascade' }).notNull(),
    senderUserId: text("sender_user_id").references(() => user.id, { onDelete: 'cascade' }).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- NOTIFICATIONS ---
export const notifications = pgTable("notifications", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => user.id, { onDelete: 'cascade' }).notNull(),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    link: text("link"),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- QUOTES (Commercial Proposals) ---
export const quotes = pgTable("quotes", {
    id: uuid("id").primaryKey().defaultRandom(),
    connectionId: uuid("connection_id").references(() => connections.id, { onDelete: 'cascade' }).notNull(),
    senderUserId: text("sender_user_id").references(() => user.id, { onDelete: 'cascade' }).notNull(),
    productName: text("product_name").notNull(),
    quantity: text("quantity").notNull(),
    unitPrice: text("unit_price").notNull(),
    totalAmount: text("total_amount").notNull(),
    currency: text("currency").default("MAD").notNull(),
    validUntil: timestamp("valid_until"),
    status: quoteStatusEnum("status").default("PENDING").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- RELATIONS ---
export const userRelations = relations(user, ({ one, many }) => ({
    farmerProfile: one(farmerProfiles),
    companyProfile: one(companyProfiles),
    sentMessages: many(messages), // User can send many messages
}));

export const farmerProfileRelations = relations(farmerProfiles, ({ one, many }) => ({
    user: one(user, { fields: [farmerProfiles.userId], references: [user.id] }),
    connections: many(connections),
}));

export const companyProfileRelations = relations(companyProfiles, ({ one, many }) => ({
    user: one(user, { fields: [companyProfiles.userId], references: [user.id] }),
    connections: many(connections),
}));

export const connectionRelations = relations(connections, ({ one, many }) => ({
    farmer: one(farmerProfiles, { fields: [connections.farmerId], references: [farmerProfiles.id] }),
    company: one(companyProfiles, { fields: [connections.companyId], references: [companyProfiles.id] }),
    messages: many(messages),
    quotes: many(quotes),
}));

export const quoteRelations = relations(quotes, ({ one }) => ({
    connection: one(connections, { fields: [quotes.connectionId], references: [connections.id] }),
    sender: one(user, { fields: [quotes.senderUserId], references: [user.id] }),
}));

export const messageRelations = relations(messages, ({ one }) => ({
    connection: one(connections, { fields: [messages.connectionId], references: [connections.id] }),
    sender: one(user, { fields: [messages.senderUserId], references: [user.id] }),
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
    user: one(user, { fields: [notifications.userId], references: [user.id] }),
}));
