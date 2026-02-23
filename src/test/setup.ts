import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Better-Auth
vi.mock('@/lib/auth', () => ({
    auth: {
        api: {
            signUpEmail: vi.fn(),
        },
    },
}));

// Mock Database
vi.mock('@/persistence/db', () => ({
    db: {
        insert: vi.fn(() => ({
            values: vi.fn(() => ({
                returning: vi.fn(() => [{ id: '123' }]),
            })),
        })),
        query: {
            user: {
                findFirst: vi.fn(),
            },
        },
    },
}));
