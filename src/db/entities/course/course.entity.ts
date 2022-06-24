import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Lesson } from '../lesson/lesson.entity';
import { InstructorCourse } from '../instructor-course/instructor-course.entity';
import { StudentCourse } from '../student-course/student-course.entity';

@Entity()
export class Course {
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
  @Index()
  @Column({
    nullable: false,
  })
  is_published: boolean;

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

  @OneToMany(() => Lesson, (lesson) => lesson.course)
  lessons: Lesson[];

  @OneToMany(
    () => InstructorCourse,
    (instructorCourse) => instructorCourse.course,
  )
  instructorCourses: InstructorCourse[];

  @OneToMany(() => StudentCourse, (studentCourse) => studentCourse.course)
  studentCourses: StudentCourse[];
}
