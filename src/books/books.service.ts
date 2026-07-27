import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService implements OnModuleInit {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async onModuleInit() {
    const count = await this.bookRepository.count();
    if (count === 0) {
      console.log('Database is empty. Seeding default books...');
      await this.bookRepository.save([
        { title: 'The Hobbit', author: 'J.R.R. Tolkien', publicationYear: 1937 },
        { title: '1984', author: 'George Orwell', publicationYear: 1949 },
        { title: 'To Kill a Mockingbird', author: 'Harper Lee', publicationYear: 1960 },
        { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', publicationYear: 1925 },
        { title: 'Pride and Prejudice', author: 'Jane Austen', publicationYear: 1813 },
      ]);
      console.log('Seeding completed!');
    }
  }

  async create(createBookDto: CreateBookDto, coverImage?: string): Promise<Book> {
    const newBook = this.bookRepository.create({
      ...createBookDto,
      ...(coverImage && { coverImage }),
    });
    return this.bookRepository.save(newBook);
  }

  async findAll(): Promise<Book[]> {
    return this.bookRepository.find();
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto, coverImage?: string): Promise<Book> {
    const book = await this.findOne(id);
    Object.assign(book, updateBookDto);
    if (coverImage) {
      book.coverImage = coverImage;
    }
    return this.bookRepository.save(book);
  }

  async remove(id: number): Promise<void> {
    const book = await this.findOne(id);
    await this.bookRepository.remove(book);
  }
}
