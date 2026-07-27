import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { BooksService } from './books.service';
import { StorageService } from './storage.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('books')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('coverImage'))
  @ResponseMessage('Book created successfully')
  async create(
    @Body() createBookDto: CreateBookDto,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    let coverImage: string | undefined;
    
    if (file) {
      coverImage = await this.storageService.uploadFile(file, baseUrl);
    }
    
    return { book: await this.booksService.create(createBookDto, coverImage) };
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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('coverImage'))
  @ResponseMessage('Book updated successfully')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    let coverImage: string | undefined;
    
    if (file) {
      coverImage = await this.storageService.uploadFile(file, baseUrl);
    }
    
    return { book: await this.booksService.update(id, updateBookDto, coverImage) };
  }

  @Delete(':id')
  @ResponseMessage('Book deleted successfully')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.booksService.remove(id);
    return null; // Return null so the interceptor just outputs { data: null }
  }
}
