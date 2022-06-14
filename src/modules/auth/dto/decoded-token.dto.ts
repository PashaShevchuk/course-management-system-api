import { UserRoles } from '../../../constants';

export class DecodedTokenDto {
  id: string;
  email: string;
  role: UserRoles;
  iat: number;
  exp: number;
}
