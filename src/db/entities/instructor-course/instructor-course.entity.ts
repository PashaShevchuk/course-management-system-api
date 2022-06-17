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

@Entity()
@Index(['course', 'instructor'], { unique: true })
export class InstructorCourse {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @ManyToOne(() => Course, (course) => course.instructorCourses, {
    onDelete: 'CASCADE',
  })
  course: Course;

  @ApiProperty()
  @ManyToOne(() => Instructor, (instructor) => instructor.instructorCourses, {
    onDelete: 'CASCADE',
  })
  instructor: Instructor;

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
