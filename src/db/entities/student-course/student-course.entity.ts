import {
  Entity,
  Column,
  ManyToOne,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Course } from '../course/course.entity';
import { Student } from '../student/student.entity';

@Entity()
@Index(['course', 'student'], { unique: true })
export class StudentCourse {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @ManyToOne(() => Course, (course) => course.studentCourses, {
    onDelete: 'CASCADE',
  })
  course: Course;

  @ApiProperty()
  @ManyToOne(() => Student, (student) => student.studentCourses, {
    onDelete: 'CASCADE',
  })
  student: Student;

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
