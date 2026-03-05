import type { AuthenticatedUser, User } from "../../domain/models/user.model";
import type { AuthenticatedUserResponse, UserResponse } from "../api/iam.api";

export const userMapper = {
  toDomain: (response: UserResponse): User => ({
    id: response.id,
    username: response.username,
    fullName: response.fullName,
    role: response.role,
  }),

  toAuthenticatedUser: (
    response: AuthenticatedUserResponse,
  ): AuthenticatedUser => {
    const rolesArray = Array.isArray(response.roles)
      ? response.roles
      : [response.roles];

    return {
      id: response.id,
      username: response.username,
      fullName: response.fullName,
      role: rolesArray[0],
      roles: rolesArray,
      token: response.token,
    };
  },
};
