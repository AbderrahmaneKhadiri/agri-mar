import { AbilityBuilder, createMongoAbility, MongoAbility, MongoQuery } from '@casl/ability';

// Roles according to our schema: "ADMIN" | "FARMER" | "COMPANY"
export type Role = "ADMIN" | "FARMER" | "COMPANY";
export type Action = 'manage' | 'create' | 'read' | 'update' | 'delete';
export type Subject = 'all' | 'FarmerProfile' | 'CompanyProfile' | 'Connection' | 'Quote' | 'Order';

export type AppAbility = MongoAbility<[Action, Subject]>;
export type AppQuery = Record<string, any>;

export function defineAbilityFor(user: { id: string, role: string }) {
    const { can, cannot, build } = new AbilityBuilder<MongoAbility<[Action, Subject], AppQuery>>(createMongoAbility);

    if (user.role === 'ADMIN') {
        can('manage', 'all'); // Admin can do anything
    } else if (user.role === 'FARMER') {
        can('read', 'FarmerProfile');
        can('update', 'FarmerProfile', { userId: user.id } as AppQuery); // Can only update their own profile

        can('read', 'CompanyProfile'); // Can see companies

        can('create', 'Connection');
        can('read', 'Connection', { farmerId: user.id } as AppQuery);
        can('update', 'Connection', { farmerId: user.id } as AppQuery);

        can('create', 'Quote');
        can('read', 'Quote', { farmerId: user.id } as AppQuery);
    } else if (user.role === 'COMPANY') {
        can('read', 'CompanyProfile');
        can('update', 'CompanyProfile', { userId: user.id } as AppQuery);

        can('read', 'FarmerProfile'); // Can see farmers

        can('create', 'Connection');
        can('read', 'Connection', { companyId: user.id } as AppQuery);
        can('update', 'Connection', { companyId: user.id } as AppQuery);

        can('create', 'Quote');
        can('read', 'Quote', { companyId: user.id } as AppQuery);
    }

    return build();
}
