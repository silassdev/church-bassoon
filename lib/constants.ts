export const UserRole = {
    ADMIN: 'admin',
    COORDINATOR: 'coordinator',
    MEMBER: 'member',
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export const AuthProvider = {
    CREDENTIALS: 'credentials',
    GOOGLE: 'google',
} as const;

export type AuthProviderType = (typeof AuthProvider)[keyof typeof AuthProvider];
