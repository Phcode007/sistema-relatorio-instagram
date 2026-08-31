/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { InstagramService } from './instagram.service';
import { InstagramController } from './instagram.controller';
import { PrismaModule } from '../database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [InstagramService],
  controllers: [InstagramController],
})
export class InstagramModule {}
