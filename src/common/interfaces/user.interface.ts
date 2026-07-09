export interface IUser {
  id: string;
  email: string;
  name: string;
  surname: string;
  patronymic: string | null;
  roleId: string;
  roleName: string;
  isActive: boolean;
  lastLoginAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}