import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Student } from '../student/student.entity';
import { Lesson } from '../lesson/lesson.entity';

@Entity()
@Index(['student', 'lesson'], { unique: true })
export class Homework {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('varchar', {
    length: 255,
    nullable: false,
  })
  file_path: string;

  @ManyToOne(() => Student, (student) => student.homeworks, {
    onDelete: 'CASCADE',
  })
  student: Student;

  @ManyToOne(() => Lesson, (lesson) => lesson.homeworks, {
    onDelete: 'CASCADE',
  })
  lesson: Lesson;

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
