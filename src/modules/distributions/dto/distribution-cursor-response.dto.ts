import { ApiProperty } from '@nestjs/swagger';
import { DistributionResponseDto } from './distribution-response.dto';

export class DistributionCursorResponseDto {
  @ApiProperty({ type: [DistributionResponseDto] })
  data: DistributionResponseDto[];

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Next cursor for pagination (null if no more data)',
    nullable: true,
  })
  nextCursor: string | null;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: true })
  hasMore: boolean;
}