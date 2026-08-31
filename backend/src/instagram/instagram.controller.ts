/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { InstagramService } from './instagram.service';
import { ConnectInstagramDto } from './dto/connect-instagram.dto';
import { SyncContentDto } from './dto/sync-content.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('instagram')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('instagram')
export class InstagramController {
  constructor(private instagramService: InstagramService) {}

  @Post('connect')
  @ApiOperation({ summary: 'Conecta a conta do Instagram de uma empresa' })
  @ApiResponse({ status: 201, description: 'Conta conectada com sucesso' })
  @ApiResponse({ status: 400, description: 'Token ou IG User ID inválidos' })
  async connect(@Body() dto: ConnectInstagramDto) {
    return this.instagramService.connect(dto);
  }

  @Get('insights')
  @ApiOperation({
    summary: 'Busca métricas de conta (alcance, visitas ao perfil, seguidores)',
  })
  async getInsights(
    @Query('companyId') companyId: string,
    @Query('since') since: string,
    @Query('until') until: string,
  ) {
    return this.instagramService.getAccountInsights(companyId, since, until);
  }

  @Post('sync')
  @ApiOperation({
    summary: 'Sincroniza Stories e Reels do dia para o relatório',
  })
  async sync(@Body() dto: SyncContentDto) {
    return this.instagramService.syncDailyContent(dto);
  }
}
