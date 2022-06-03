import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class UserRole {
  @PrimaryColumn('varchar', {
    length: 255,
  })
  role: string;

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
}
