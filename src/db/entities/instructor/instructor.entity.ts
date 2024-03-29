import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserRoles } from '../../../constants';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { InstructorCourse } from '../instructor-course/instructor-course.entity';
import { CourseFeedback } from '../course-feedback/course-feedback.entity';

@Entity()
export class Instructor {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('varchar', {
    length: 100,
    nullable: false,
  })
  first_name: string;

  @ApiProperty()
  @Column('varchar', {
    length: 100,
    nullable: false,
  })
  last_name: string;

  @ApiProperty()
  @Column({
    unique: true,
    length: 255,
    nullable: false,
  })
  email: string;

  @Exclude()
  @Column('varchar', {
    length: 150,
    nullable: false,
  })
  hash_password: string;

  @ApiProperty()
  @Column('varchar', {
    length: 255,
    nullable: false,
  })
  position: string;

  @ApiProperty()
  @Column({
    nullable: false,
  })
  is_active: boolean;

  @ApiProperty()
  @Column({ type: 'enum', enum: UserRoles, default: UserRoles.INSTRUCTOR })
  role: UserRoles;

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

  @OneToMany(
    () => InstructorCourse,
    (instructorCourse) => instructorCourse.instructor,
  )
  instructorCourses: InstructorCourse[];

  @OneToMany(
    () => CourseFeedback,
    (instructorFeedback) => instructorFeedback.instructor,
  )
  instructorFeedbacks: CourseFeedback[];
}
