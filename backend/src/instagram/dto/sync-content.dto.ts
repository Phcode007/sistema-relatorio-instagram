import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} 
from 'class-validator';
export class SyncContentDto {
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @IsDateString()
  @IsOptional()
  date?: string; 
}
