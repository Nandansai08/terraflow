import { Controller, Get, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { ModerationService } from './moderation.service.js';
import { GetReportsQueryDto } from './get-reports-query.dto.js';
import { UpdateReportDto } from './update-report.dto.js';

@Controller('api/v1/moderation')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ModerationController {
  constructor(
    private readonly moderationService: ModerationService,
  ) {}

  @Get('reports')
  @Roles('ADMIN', 'MODERATOR')
  async getReports(@Query() query: GetReportsQueryDto) {
    return this.moderationService.getReports(query.status, query.page, query.limit);
  }

  @Patch('reports/:id')
  @Roles('ADMIN', 'MODERATOR')
  async updateReport(
    @Param('id') id: string,
    @Body() body: UpdateReportDto,
  ) {
    return this.moderationService.updateReportStatus(id, body.status);
  }
}
