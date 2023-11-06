import { Base } from 'src/utils/Base';
import { Column, Entity } from 'typeorm';

@Entity()
export class UserEntity extends Base {
  @Column({ default: '', unique: true })
  email: string;

  @Column({ default: '', name: 'user_name' })
  userName: string;

  @Column({ default: '', select: false })
  password: string;

  @Column({ default: false, name: 'is_verified' })
  isVerified: boolean;
}
