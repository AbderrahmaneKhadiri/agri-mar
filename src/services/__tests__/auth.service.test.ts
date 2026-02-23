import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerUser } from '../auth.service';
import { userRepository } from '@/persistence/repositories/user.repository';
import { auth } from '@/lib/auth';

describe('AuthService - registerUser', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return error if email already exists', async () => {
        vi.spyOn(userRepository, 'findByEmail').mockResolvedValue({ id: '1' } as any);

        const result = await registerUser({
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
            role: 'FARMER'
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Cet email est déjà utilisé.');
    });

    it('should call Better-Auth signUpEmail on success', async () => {
        vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(null as any);
        (auth.api.signUpEmail as any).mockResolvedValue({ user: { id: 'new-user' } });

        const result = await registerUser({
            email: 'new@example.com',
            password: 'password123',
            name: 'New User',
            role: 'FARMER'
        });

        expect(result.success).toBe(true);
        expect(auth.api.signUpEmail).toHaveBeenCalled();
    });
});
