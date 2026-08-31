/* eslint-disable prettier/prettier */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ConnectInstagramDto } from './dto/connect-instagram.dto';
import { SyncContentDto } from './dto/sync-content.dto';

const GRAPH_API_VERSION = 'v21.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

@Injectable()
export class InstagramService {
  constructor(private prisma: PrismaService) {}

  async connect(dto: ConnectInstagramDto) {
    // Valida o token chamando um endpoint simples antes de salvar
    const check = await fetch(
      `${GRAPH_API_BASE}/${dto.igUserId}?fields=username&access_token=${dto.pageAccessToken}`,
    );
    const checkData = await check.json();

    if (!check.ok) {
      throw new BadRequestException(
        `Token ou IG User ID inválidos: ${checkData?.error?.message ?? 'erro desconhecido'}`,
      );
    }

    const account = await this.prisma.instagramAccount.upsert({
      where: { companyId: dto.companyId },
      update: {
        igUserId: dto.igUserId,
        igUsername: checkData.username,
        pageAccessToken: dto.pageAccessToken,
      },
      create: {
        companyId: dto.companyId,
        igUserId: dto.igUserId,
        igUsername: checkData.username,
        pageAccessToken: dto.pageAccessToken,
      },
    });

    return {
      companyId: account.companyId,
      igUsername: account.igUsername,
      connectedAt: account.connectedAt,
    };
  }

  private async getAccount(companyId: string) {
    const account = await this.prisma.instagramAccount.findUnique({
      where: { companyId },
    });

    if (!account) {
      throw new NotFoundException(
        'Nenhuma conta do Instagram conectada para essa empresa. Use POST /instagram/connect primeiro.',
      );
    }

    return account;
  }

  async getAccountInsights(companyId: string, since: string, until: string) {
    const account = await this.getAccount(companyId);

    const metrics = ['reach', 'profile_views', 'follower_count'].join(',');
    const url =
      `${GRAPH_API_BASE}/${account.igUserId}/insights` +
      `?metric=${metrics}&period=day&since=${since}&until=${until}` +
      `&access_token=${account.pageAccessToken}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new BadRequestException(
        data?.error?.message ?? 'Erro ao buscar insights',
      );
    }

    return data;
  }

  async syncDailyContent(dto: SyncContentDto) {
    const account = await this.getAccount(dto.companyId);
    const targetDate = dto.date ? new Date(dto.date) : new Date();
    const dateOnly = targetDate.toISOString().slice(0, 10);

    // Busca mídias publicadas (reels/posts) e stories ativos
    const [mediaRes, storiesRes] = await Promise.all([
      fetch(
        `${GRAPH_API_BASE}/${account.igUserId}/media` +
          `?fields=id,media_type,media_product_type,timestamp&access_token=${account.pageAccessToken}`,
      ),
      fetch(
        `${GRAPH_API_BASE}/${account.igUserId}/stories` +
          `?fields=id,timestamp&access_token=${account.pageAccessToken}`,
      ),
    ]);

    const mediaData = await mediaRes.json();
    const storiesData = await storiesRes.json();

    if (!mediaRes.ok) throw new BadRequestException(mediaData?.error?.message);
    if (!storiesRes.ok)
      throw new BadRequestException(storiesData?.error?.message);

    const reelsToday = (mediaData.data ?? []).filter(
      (m: { media_product_type: string; timestamp: string }) =>
        m.media_product_type === 'REELS' && m.timestamp.startsWith(dateOnly),
    );
    const storiesToday = (storiesData.data ?? []).filter(
      (s: { timestamp: string }) => s.timestamp.startsWith(dateOnly),
    );

    const reelViews = await this.sumInsight(
      reelsToday,
      account.pageAccessToken,
      'plays',
    );
    const storyViews = await this.sumInsight(
      storiesToday,
      account.pageAccessToken,
      'impressions',
    );

    return {
      date: dateOnly,
      stories: storiesToday.length,
      storyViews,
      reels: reelsToday.length,
      reelViews,
    };
    // OBS: aqui você ainda precisa achar/criar o `Report` do mês e fazer
    // upsert em `ContentRecord` — deixei só a coleta dos dados da API por
    // enquanto pra você plugar na lógica de Report que ainda vai construir.
  }

  private async sumInsight(
    items: { id: string }[],
    token: string,
    metric: string,
  ): Promise<number> {
    let total = 0;
    for (const item of items) {
      const res = await fetch(
        `${GRAPH_API_BASE}/${item.id}/insights?metric=${metric}&access_token=${token}`,
      );
      const data = await res.json();
      total += data?.data?.[0]?.values?.[0]?.value ?? 0;
    }
    return total;
  }
}
