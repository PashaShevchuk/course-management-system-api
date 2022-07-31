import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Course } from '../course/course.entity';
import { StudentMark } from '../student-mark/student-mark.entity';
import { Homework } from '../homework/homework.entity';

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

  @ApiProperty({ type: () => Course })
  @ManyToOne(() => Course, (course) => course.lessons, {
    onDelete: 'CASCADE',
  })
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

  @OneToMany(() => StudentMark, (studentMark) => studentMark.lesson)
  marks: StudentMark[];

  @OneToMany(() => Homework, (homework) => homework.lesson)
  homeworks: Homework[];
}
