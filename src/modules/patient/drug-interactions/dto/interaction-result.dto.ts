import { ApiProperty } from '@nestjs/swagger';

export class InteractionResultDto {
  @ApiProperty({
    description: 'First drug in the interaction',
    example: 'Aspirin',
  })
  drug1: string;

  @ApiProperty({
    description: 'Second drug in the interaction',
    example: 'Warfarin',
  })
  drug2: string;

  @ApiProperty({
    description: 'Interaction category',
    example: 'C',
    enum: ['A', 'B', 'C', 'D', 'X'],
  })
  category: 'A' | 'B' | 'C' | 'D' | 'X';

  @ApiProperty({
    description: 'Description of the interaction',
    example: 'Monitor therapy',
  })
  description: string;
}

export class CheckInteractionsResponseDto {
  @ApiProperty({
    description: 'List of interactions found',
    type: [InteractionResultDto],
  })
  interactions: InteractionResultDto[];

  @ApiProperty({
    description: 'Warning messages',
    type: [String],
    example: ['Duplicate drugs found', 'Unknown drug: XYZ'],
  })
  warnings: string[];
}
