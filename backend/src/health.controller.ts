import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Verifica a disponibilidade da API' })
  @ApiResponse({ status: 200, schema: { example: { status: 'ok' } } })
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}
