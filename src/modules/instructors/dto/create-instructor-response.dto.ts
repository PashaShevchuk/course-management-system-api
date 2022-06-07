import { Expose } from 'class-transformer';
import { UserRoles } from '../../../constants';

export class CreateInstructorResponseDto {
  @Expose()
  id: string;

  @Expose()
  first_name: string;

  @Expose()
  last_name: string;

  @Expose()
  email: string;

  @Expose()
  position: string;

  @Expose()
  is_active: boolean;

  @Expose()
  created_at: string;

  @Expose()
  updated_at: string;

  @Expose()
  role: UserRoles;
}
