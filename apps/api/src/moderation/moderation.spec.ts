import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { ModerationService } from './moderation.service.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { prisma, ReportStatus } from '@terraflow/database';
import { validate } from 'class-validator';
import { UpdateReportDto } from './update-report.dto.js';
import { GetReportsQueryDto } from './get-reports-query.dto.js';

vi.mock('@terraflow/database', () => {
  const mockPrisma = {
    report: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    post: {
      update: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(mockPrisma)),
  };
  return {
    prisma: mockPrisma,
    ReportStatus: {
      PENDING: 'PENDING',
      REVIEWED: 'REVIEWED',
      DISMISSED: 'DISMISSED',
      RESOLVED: 'RESOLVED',
    },
  };
});

describe('Moderation Service & RolesGuard Suite', () => {
  let moderationService: ModerationService;

  beforeEach(() => {
    moderationService = new ModerationService();
    vi.clearAllMocks();
  });

  describe('ModerationService.getReports()', () => {
    it('should return reports with reporter and post details and apply filters', async () => {
      const mockReports = [
        {
          id: 'report-1',
          reason: 'Spam',
          status: ReportStatus.PENDING,
          reporter: { id: 'u1', username: 'reporter1' },
          post: { id: 'p1', title: 'Post title' },
        },
      ];

      (prisma.report.findMany as Mock).mockResolvedValue(mockReports);

      const result = await moderationService.getReports(ReportStatus.PENDING, 1, 50);
      expect(result).toEqual(mockReports);
      expect(prisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: ReportStatus.PENDING },
          skip: 0,
          take: 50,
          include: expect.objectContaining({
            reporter: expect.any(Object),
            post: expect.any(Object),
          }),
        })
      );
    });

    it('should default to PENDING status, page 1, and limit 50 when no parameters are provided', async () => {
      (prisma.report.findMany as Mock).mockResolvedValue([]);
      await moderationService.getReports();
      expect(prisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: ReportStatus.PENDING },
          skip: 0,
          take: 50,
        })
      );
    });

    it('should query with custom status, page, and limit parameters', async () => {
      (prisma.report.findMany as Mock).mockResolvedValue([]);
      await moderationService.getReports(ReportStatus.RESOLVED, 3, 15);
      expect(prisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: ReportStatus.RESOLVED },
          skip: 30, // (3 - 1) * 15
          take: 15,
        })
      );
    });
  });

  describe('ModerationService.updateReportStatus()', () => {
    it('should update status and mark post as moderated when status is RESOLVED', async () => {
      const mockReport = {
        id: 'report-1',
        postId: 'post-1',
        reason: 'Spam',
        status: ReportStatus.PENDING,
      };

      (prisma.report.findUnique as Mock).mockResolvedValue(mockReport);
      (prisma.report.update as Mock).mockResolvedValue({
        ...mockReport,
        status: ReportStatus.RESOLVED,
      });

      const result = await moderationService.updateReportStatus('report-1', ReportStatus.RESOLVED);

      expect(result.status).toBe(ReportStatus.RESOLVED);
      expect(prisma.report.update).toHaveBeenCalledWith({
        where: { id: 'report-1' },
        data: { status: ReportStatus.RESOLVED },
      });
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: 'post-1' },
        data: { isModerated: true },
      });
    });

    it('should update status but NOT mark post as moderated when status is other than RESOLVED', async () => {
      const mockReport = {
        id: 'report-1',
        postId: 'post-1',
        reason: 'Spam',
        status: ReportStatus.PENDING,
      };

      (prisma.report.findUnique as Mock).mockResolvedValue(mockReport);
      (prisma.report.update as Mock).mockResolvedValue({
        ...mockReport,
        status: ReportStatus.REVIEWED,
      });

      const result = await moderationService.updateReportStatus('report-1', ReportStatus.REVIEWED);

      expect(result.status).toBe(ReportStatus.REVIEWED);
      expect(prisma.report.update).toHaveBeenCalledWith({
        where: { id: 'report-1' },
        data: { status: ReportStatus.REVIEWED },
      });
      expect(prisma.post.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if report does not exist', async () => {
      (prisma.report.findUnique as Mock).mockResolvedValue(null);

      await expect(
        moderationService.updateReportStatus('invalid-id', ReportStatus.RESOLVED)
      ).rejects.toThrow('Report not found');
    });
  });

  describe('RolesGuard Authorization', () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    const createMockContext = (role?: string, userExists = true) => {
      const request = userExists ? { user: { role } } : {};
      return {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as unknown as ExecutionContext;
    };

    beforeEach(() => {
      reflector = {
        getAllAndOverride: vi.fn(),
      } as any;
      guard = new RolesGuard(reflector);
    });

    it('should allow access if no roles are required', () => {
      vi.mocked(reflector.getAllAndOverride).mockReturnValue(undefined);
      const context = createMockContext('USER');
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny access if user has USER role and route requires MODERATOR or ADMIN', () => {
      vi.mocked(reflector.getAllAndOverride).mockReturnValue(['MODERATOR', 'ADMIN']);
      const context = createMockContext('USER');
      expect(guard.canActivate(context)).toBe(false);
    });

    it('should allow access if user has MODERATOR role and route requires MODERATOR or ADMIN', () => {
      vi.mocked(reflector.getAllAndOverride).mockReturnValue(['MODERATOR', 'ADMIN']);
      const context = createMockContext('MODERATOR');
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access if user has ADMIN role and route requires MODERATOR or ADMIN', () => {
      vi.mocked(reflector.getAllAndOverride).mockReturnValue(['MODERATOR', 'ADMIN']);
      const context = createMockContext('ADMIN');
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny access if user has no roles or user is not logged in', () => {
      vi.mocked(reflector.getAllAndOverride).mockReturnValue(['MODERATOR', 'ADMIN']);
      const context1 = createMockContext(undefined, false);
      const context2 = createMockContext(undefined, true);
      expect(guard.canActivate(context1)).toBe(false);
      expect(guard.canActivate(context2)).toBe(false);
    });
  });

  describe('DTO Validation Tests', () => {
    describe('UpdateReportDto', () => {
      it('should pass with a valid status', async () => {
        const dto = new UpdateReportDto();
        dto.status = ReportStatus.RESOLVED;
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should fail with an invalid status', async () => {
        const dto = new UpdateReportDto();
        dto.status = 'INVALID_STATUS' as any;
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isEnum');
      });
    });

    describe('GetReportsQueryDto', () => {
      it('should pass with valid status and pagination parameters', async () => {
        const dto = new GetReportsQueryDto();
        dto.status = ReportStatus.PENDING;
        dto.page = 1;
        dto.limit = 10;
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should fail with invalid query parameter values', async () => {
        const dto = new GetReportsQueryDto();
        dto.status = 'INVALID_STATUS' as any;
        dto.page = 0; // page must be at least 1
        dto.limit = -5; // limit must be at least 1
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });

      it('should respect default values', async () => {
        const dto = new GetReportsQueryDto();
        expect(dto.status).toBe(ReportStatus.PENDING);
        expect(dto.page).toBe(1);
        expect(dto.limit).toBe(50);
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });
    });
  });
});
