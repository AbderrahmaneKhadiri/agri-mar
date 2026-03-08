import { db } from "@/persistence/db";
import { tenders, tenderBids, farmerProfiles, companyProfiles, user } from "@/persistence/schema";
import { eq, and, desc, sql, ilike } from "drizzle-orm";

export type TenderInsertDTO = typeof tenders.$inferInsert;
export type TenderSelectDTO = typeof tenders.$inferSelect;
export type TenderBidInsertDTO = typeof tenderBids.$inferInsert;
export type TenderBidSelectDTO = typeof tenderBids.$inferSelect;

// --- TENDERS ---

export async function createTender(data: TenderInsertDTO) {
    const [created] = await db.insert(tenders).values(data).returning();
    return created;
}

export async function updateTenderStatus(id: string, companyId: string, status: "OPEN" | "CLOSED" | "FULFILLED") {
    const [updated] = await db.update(tenders)
        .set({ status, updatedAt: new Date() })
        .where(
            and(
                eq(tenders.id, id),
                eq(tenders.companyId, companyId)
            )
        )
        .returning();
    return updated;
}

export async function getCompanyTenders(companyId: string) {
    const results = await db.select({
        tender: tenders,
        bid: tenderBids,
        farmer: farmerProfiles,
        user: user,
    })
        .from(tenders)
        .leftJoin(tenderBids, eq(tenders.id, tenderBids.tenderId))
        .leftJoin(farmerProfiles, eq(tenderBids.farmerId, farmerProfiles.id))
        .leftJoin(user, eq(farmerProfiles.userId, user.id))
        .where(eq(tenders.companyId, companyId))
        .orderBy(desc(tenders.createdAt));

    // Grouping results back into nested structure
    const tenderMap = new Map<string, any>();

    results.forEach(row => {
        if (!tenderMap.has(row.tender.id)) {
            tenderMap.set(row.tender.id, { ...row.tender, bids: [] });
        }
        if (row.bid) {
            tenderMap.get(row.tender.id).bids.push({
                ...row.bid,
                farmer: row.farmer ? { ...row.farmer, user: row.user } : null
            });
        }
    });

    return Array.from(tenderMap.values());
}

export async function deleteTender(id: string, companyId: string) {
    const [deleted] = await db.delete(tenders)
        .where(
            and(
                eq(tenders.id, id),
                eq(tenders.companyId, companyId)
            )
        )
        .returning();
    return deleted;
}

export async function getOpenTenders(filters?: { category?: string, search?: string }) {
    const conditions = [eq(tenders.status, "OPEN")];

    if (filters?.category && filters.category !== "Toutes") {
        conditions.push(eq(tenders.category, filters.category));
    }

    if (filters?.search) {
        conditions.push(ilike(tenders.title, `%${filters.search}%`));
    }

    const results = await db.select({
        tender: tenders,
        company: companyProfiles,
    })
        .from(tenders)
        .leftJoin(companyProfiles, eq(tenders.companyId, companyProfiles.id))
        .where(and(...conditions))
        .orderBy(desc(tenders.createdAt));

    return results.map(row => ({
        ...row.tender,
        company: row.company
    }));
}

export async function getTenderById(id: string) {
    const results = await db.select({
        tender: tenders,
        company: companyProfiles,
        bid: tenderBids,
        farmer: farmerProfiles,
        user: user,
    })
        .from(tenders)
        .leftJoin(companyProfiles, eq(tenders.companyId, companyProfiles.id))
        .leftJoin(tenderBids, eq(tenders.id, tenderBids.tenderId))
        .leftJoin(farmerProfiles, eq(tenderBids.farmerId, farmerProfiles.id))
        .leftJoin(user, eq(farmerProfiles.userId, user.id))
        .where(eq(tenders.id, id));

    if (results.length === 0) return null;

    const first = results[0];
    const tender = {
        ...first.tender,
        company: first.company,
        bids: [] as any[]
    };

    results.forEach(row => {
        if (row.bid) {
            tender.bids.push({
                ...row.bid,
                farmer: row.farmer ? { ...row.farmer, user: row.user } : null
            });
        }
    });

    return tender;
}

// --- BIDS ---

export async function createTenderBid(data: TenderBidInsertDTO) {
    const [created] = await db.insert(tenderBids).values(data).returning();
    return created;
}

export async function getFarmerBids(farmerId: string) {
    const results = await db.select({
        bid: tenderBids,
        tender: tenders,
        company: companyProfiles,
    })
        .from(tenderBids)
        .leftJoin(tenders, eq(tenderBids.tenderId, tenders.id))
        .leftJoin(companyProfiles, eq(tenders.companyId, companyProfiles.id))
        .where(eq(tenderBids.farmerId, farmerId))
        .orderBy(desc(tenderBids.createdAt));

    return results.map(row => ({
        ...row.bid,
        tender: row.tender ? {
            ...row.tender,
            company: row.company
        } : null
    }));
}

export async function updateTenderBidStatus(id: string, tenderId: string, status: "PENDING" | "ACCEPTED" | "REJECTED") {
    const [updated] = await db.update(tenderBids)
        .set({ status, updatedAt: new Date() })
        .where(
            and(
                eq(tenderBids.id, id),
                eq(tenderBids.tenderId, tenderId)
            )
        )
        .returning();
    return updated;
}

export async function deleteTenderBid(id: string, farmerId: string) {
    const [deleted] = await db.delete(tenderBids)
        .where(
            and(
                eq(tenderBids.id, id),
                eq(tenderBids.farmerId, farmerId)
            )
        )
        .returning();
    return deleted;
}
