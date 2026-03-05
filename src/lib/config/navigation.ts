import {
    LayoutDashboard,
    ShoppingCart,
    ClipboardList,
    MessageSquare,
    Users,
    Settings,
    PackageOpen,
    Calendar,
    Zap,
    Globe,
    User,
    ShoppingBag,
    Network
} from "lucide-react";

export type NavItem = {
    title: string;
    href: string;
    icon: any;
};

export type NavGroup = {
    title: string;
    items: NavItem[];
};

export const FARMER_NAV_GROUPS: NavGroup[] = [
    {
        title: "Pilotage",
        items: [
            {
                title: "Vue d'ensemble",
                href: "/dashboard/farmer",
                icon: LayoutDashboard,
            },
        ],
    },
    {
        title: "Activités Commerciales",
        items: [
            {
                title: "Mes Demandes",
                href: "/dashboard/farmer?tab=requests",
                icon: ClipboardList,
            },
            {
                title: "Appels d'Offres",
                href: "/dashboard/farmer?tab=tenders",
                icon: ShoppingCart,
            },
            {
                title: "Mes Partenaires",
                href: "/dashboard/farmer?tab=partners",
                icon: Users,
            },
            {
                title: "Mon Catalogue",
                href: "/dashboard/farmer?tab=products",
                icon: PackageOpen,
            },
        ],
    },
    {
        title: "Gestion de l'Exploitation",
        items: [
            {
                title: "Planning Récolte",
                href: "/dashboard/farmer?tab=planning",
                icon: Calendar,
            },
            {
                title: "Finances",
                href: "/dashboard/farmer?tab=finances",
                icon: Zap,
            },
            {
                title: "Ma Terre & Météo",
                href: "/dashboard/farmer?tab=land",
                icon: Globe,
            },
        ],
    },
    {
        title: "Messagerie & Profil",
        items: [
            {
                title: "Messagerie",
                href: "/dashboard/farmer/messages",
                icon: MessageSquare,
            },
            {
                title: "Mon Profil",
                href: "/dashboard/farmer?tab=profile",
                icon: User,
            },
        ],
    },
];

export const COMPANY_NAV_GROUPS: NavGroup[] = [
    {
        title: "Pilotage",
        items: [
            {
                title: "Vue d'ensemble",
                href: "/dashboard/company",
                icon: LayoutDashboard,
            },
        ],
    },
    {
        title: "Sourcing & Marché",
        items: [
            {
                title: "Marché Agricole",
                href: "/dashboard/company?tab=market",
                icon: ShoppingBag,
            },
            {
                title: "Réseau Agriculteurs",
                href: "/dashboard/company?tab=network",
                icon: Network,
            },
            {
                title: "Mes Fournisseurs",
                href: "/dashboard/company?tab=suppliers",
                icon: Users,
            },
            {
                title: "Sourcing & Monitoring",
                href: "/dashboard/company?tab=monitoring",
                icon: Globe,
            },
        ],
    },
    {
        title: "Commercial & Demandes",
        items: [
            {
                title: "Appels d'Offres",
                href: "/dashboard/company?tab=tenders",
                icon: ClipboardList,
            },
            {
                title: "Demandes",
                href: "/dashboard/company?tab=requests",
                icon: PackageOpen,
            },
        ],
    },
    {
        title: "Messagerie & Profil",
        items: [
            {
                title: "Messagerie",
                href: "/dashboard/company/messages",
                icon: MessageSquare,
            },
            {
                title: "Mon Profil",
                href: "/dashboard/company?tab=profile",
                icon: User,
            },
        ],
    },
];

export const COMMON_FOOTER_NAV_ITEMS: NavItem[] = [
    {
        title: "Paramètres",
        href: "/dashboard/settings",
        icon: Settings,
    },
];
