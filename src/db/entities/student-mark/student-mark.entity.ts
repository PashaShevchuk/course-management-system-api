import {
  Entity,
  Column,
  ManyToOne,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Student } from '../student/student.entity';
import { Lesson } from '../lesson/lesson.entity';

@Entity()
@Index(['student', 'lesson'], { unique: true })
export class StudentMark {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('int', {
    nullable: false,
  })
  mark: string;

  @ManyToOne(() => Student, (student) => student.marks, {
    onDelete: 'CASCADE',
  })
  student: Student;

  @ManyToOne(() => Lesson, (lesson) => lesson.marks, {
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
