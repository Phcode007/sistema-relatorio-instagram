import { IsNotEmpty, IsString } from 'class-validator';
export class ConnectInstagramDto {
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @IsString()
  @IsNotEmpty()
  igUserId!: string;

  @IsString()
  @IsNotEmpty()
  pageAccessToken!: string;
}
