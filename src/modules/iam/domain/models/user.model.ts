export interface User {
    id: number;
    username: string;
    fullName: string;
    role: UserRole;
}

export interface AuthenticatedUser extends User {
    token: string;
    roles: UserRole[];
} 

export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER'
}