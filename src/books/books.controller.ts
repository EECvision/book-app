import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ResponseMessage('Book created successfully')
  async create(@Body() createBookDto: CreateBookDto) {
    return { book: await this.booksService.create(createBookDto) };
  }

  @Get()
  @ResponseMessage('Books fetched successfully')
  async findAll() {
    return { books: await this.booksService.findAll() };
  }

  @Get(':id')
  @ResponseMessage('Book fetched successfully')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return { book: await this.booksService.findOne(id) };
  }

  @Patch(':id')
  @ResponseMessage('Book updated successfully')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return { book: await this.booksService.update(id, updateBookDto) };
  }

  @Delete(':id')
  @ResponseMessage('Book deleted successfully')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.booksService.remove(id);
    return null; // Return null so the interceptor just outputs { data: null }
  }
}
