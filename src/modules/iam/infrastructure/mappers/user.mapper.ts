import type { AuthenticatedUser, User } from "../../domain/models/user.model";
import type { AuthenticatedUserResponse, UserResponse } from "../api/iam.api";

export const userMapper = {
    toDomain: (response: UserResponse): User => ({
        id: response.id,
        username: response.username,
        fullName: response.fullName,
        role: response.role
    }),

    toAuthenticatedUser: (response: AuthenticatedUserResponse): AuthenticatedUser => ({
        id: response.id,
        username: response.username,
        fullName: response.fullName,
        role: response.roles[0],
        roles: response.roles,
        token: response.token
    }),
}