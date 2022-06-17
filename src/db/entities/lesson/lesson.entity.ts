import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Course } from '../course/course.entity';

@Entity()
export class Lesson {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('varchar', {
    length: 255,
    nullable: false,
  })
  title: string;

  @ApiProperty()
  @Column('varchar', {
    length: 1000,
    nullable: false,
  })
  description: string;

  @ApiProperty()
  @Column('int', {
    nullable: false,
  })
  highest_mark: number;

  @ManyToOne(() => Course, (course) => course.lessons)
  course: Course;

  @ApiProperty()
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  created_at: string;

  @ApiProperty()
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at: string;
}
