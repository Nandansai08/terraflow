import { IsEnum } from 'class-validator';
import { ReportStatus } from '@terraflow/database';

export class UpdateReportDto {
  @IsEnum(ReportStatus)
  status!: ReportStatus;
}
