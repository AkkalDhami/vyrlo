import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import type { RequestType } from '@/types';
import { AuthGuard } from '@/guards/auth.guard';

@Controller('api-keys')
@UseGuards(AuthGuard)
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  async createApiKey(@Req() req: RequestType) {
    return this.apiKeyService.createApiKey(req.user.id);
  }

  @Get()
  async listApiKeys(@Req() req: RequestType) {
    return this.apiKeyService.listApiKeys(req.user.id);
  }

  @Get(':id')
  async apiKeyLastUsed(@Req() req: RequestType) {
    return this.apiKeyService.getApiKeyLastUsed(req.user.id);
  }

  @Delete(':id')
  async deleteApiKey(@Req() req: RequestType, @Param('id') keyId: string) {
    return this.apiKeyService.deleteApiKey(req.user.id, keyId);
  }

  @Post(':id/regenerate')
  async regenerateApiKey(@Req() req: RequestType, @Param('id') keyId: string) {
    return this.apiKeyService.regenerateApiKey(req.user.id, keyId);
  }
}
