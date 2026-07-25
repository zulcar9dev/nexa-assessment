export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
}

export type UserRole = AuthenticatedUser['role'];
