import { Controller, Get, HttpStatus, HttpException } from '@nestjs/common';
import { HealthService } from './health.service';
import { getISTTimestamp } from '../../common/utils/time.utils';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('health')
  async checkHealth() {
    try {
      const healthStatus = await this.healthService.checkHealth();

      if (healthStatus.status === 'unhealthy') {
        throw new HttpException(healthStatus, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return healthStatus;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: 'unhealthy',
          timestamp: getISTTimestamp(),
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
