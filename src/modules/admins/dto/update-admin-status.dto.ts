import { IsNotEmpty } from 'class-validator';

export class UpdateAdminStatusDto {
  @IsNotEmpty()
  is_active: boolean;
}
