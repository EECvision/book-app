import { IsString, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  publicationYear: number;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  coverImage?: any;
}
