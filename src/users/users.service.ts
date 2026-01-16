import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ username });
  }

  async create(username: string, passwordHash: string): Promise<User> {
    const newUser = this.usersRepository.create({
      username,
      password: passwordHash,
    });

    try {
      return await this.usersRepository.save(newUser);
    } catch (error) {
      const pgError = error as { code?: string; message?: string };

      if (
        pgError.code === '23505' ||
        (pgError.message && pgError.message.includes('unique'))
      ) {
        throw new ConflictException('Użytkownik już istnieje');
      }

      throw error;
    }
  }
}
