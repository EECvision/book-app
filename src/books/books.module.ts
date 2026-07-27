import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { Book } from './entities/book.entity';
import { StorageService } from './storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([Book])],
  providers: [BooksService, StorageService],
  controllers: [BooksController]
})
export class BooksModule {}
