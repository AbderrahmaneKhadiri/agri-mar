import { LayoutDashboard, ShoppingCart, ClipboardList, MessageSquare, Users, Settings } from "lucide-react";

export type NavItem = {
    title: string;
    href: string;
    icon: any;
};

export const FARMER_NAV_ITEMS: NavItem[] = [
    {
        title: "Tableau de bord",
        href: "/dashboard/farmer",
        icon: LayoutDashboard,
    },
    {
        title: "Mes Demandes",
        href: "/dashboard/farmer/requests",
        icon: ClipboardList,
    },
    {
        title: "Mes Partenaires",
        href: "/dashboard/farmer/partners",
        icon: Users,
    },
    {
        title: "Messagerie",
        href: "/dashboard/farmer/messages",
        icon: MessageSquare,
    },
];

export const COMPANY_NAV_ITEMS: NavItem[] = [
    {
        title: "Tableau de bord",
        href: "/dashboard/company",
        icon: LayoutDashboard,
    },
    {
        title: "Marché Agricole",
        href: "/dashboard/company/market",
        icon: ShoppingCart,
    },
    {
        title: "Mes Demandes",
        href: "/dashboard/company/requests",
        icon: ClipboardList,
    },
    {
        title: "Messagerie",
        href: "/dashboard/company/messages",
        icon: MessageSquare,
    },
    {
        title: "Mes Fournisseurs",
        href: "/dashboard/company/suppliers",
        icon: Users,
    },
];

export const COMMON_FOOTER_NAV_ITEMS: NavItem[] = [
    {
        title: "Paramètres",
        href: "/dashboard/settings",
        icon: Settings,
    },
];
