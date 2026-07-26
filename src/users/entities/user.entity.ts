import { Entity, Column, PrimaryColumn, BeforeInsert } from 'typeorm';
import { nanoid } from 'nanoid';

@Entity()
export class User {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // don't return password by default
  password?: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ default: 0 })
  tokenVersion: number;

  @Column({ type: 'varchar', nullable: true, select: false }) // don't return refresh token hash by default
  hashedRefreshToken?: string | null;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = `usr_${nanoid(10)}`;
    }
  }
}
