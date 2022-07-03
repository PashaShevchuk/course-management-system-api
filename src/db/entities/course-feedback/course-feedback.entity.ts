import {
  Entity,
  Column,
  ManyToOne,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Course } from '../course/course.entity';
import { Instructor } from '../instructor/instructor.entity';
import { Student } from '../student/student.entity';

@Entity()
@Index(['course', 'instructor', 'student'], { unique: true })
export class CourseFeedback {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('varchar', {
    length: 2000,
    nullable: false,
  })
  text: string;

  @ApiProperty()
  @ManyToOne(() => Course, (course) => course.courseFeedbacks, {
    onDelete: 'CASCADE',
  })
  course: Course;

  @ApiProperty()
  @ManyToOne(() => Instructor, (instructor) => instructor.instructorFeedbacks, {
    onDelete: 'CASCADE',
  })
  instructor: Instructor;

  @ApiProperty()
  @ManyToOne(() => Student, (student) => student.studentFeedbacks, {
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
