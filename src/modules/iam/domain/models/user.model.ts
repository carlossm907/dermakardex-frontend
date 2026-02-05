export interface User {
    id: number;
    username: string;
    fullName: string;
    role: string;
}

export interface AuthenticatedUser extends User {
    token: string;
    roles: string;
} 

export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER'
}