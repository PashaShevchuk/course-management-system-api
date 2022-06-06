import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { UserRoles } from '../../../constants';

@Entity()
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    length: 100,
    nullable: false,
  })
  first_name: string;

  @Column('varchar', {
    length: 100,
    nullable: false,
  })
  last_name: string;

  @Column({
    unique: true,
    length: 255,
    nullable: false,
  })
  email: string;

  @Column('varchar', {
    length: 150,
    nullable: false,
  })
  hash_password: string;

  @Column({
    nullable: false,
  })
  is_active: boolean;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  created_at: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at: string;

  @Column({ type: 'enum', enum: UserRoles })
  role: UserRoles;
}
