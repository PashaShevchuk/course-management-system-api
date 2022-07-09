import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserRoles } from '../../../constants';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { StudentCourse } from '../student-course/student-course.entity';
import { CourseFeedback } from '../course-feedback/course-feedback.entity';
import { StudentMark } from '../student-mark/student-mark.entity';

@Entity()
export class Student {
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
  @Column('date', {
    nullable: true,
  })
  birth_date: string;

  @ApiProperty()
  @Column({
    nullable: false,
  })
  is_active: boolean;

  @ApiProperty()
  @Column({ type: 'enum', enum: UserRoles, default: UserRoles.STUDENT })
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

  @OneToMany(() => StudentCourse, (studentCourse) => studentCourse.student)
  studentCourses: StudentCourse[];

  @OneToMany(() => CourseFeedback, (courseFeedback) => courseFeedback.student)
  studentFeedbacks: CourseFeedback[];

  @OneToMany(() => StudentMark, (studentMark) => studentMark.student)
  marks: StudentMark[];
}
