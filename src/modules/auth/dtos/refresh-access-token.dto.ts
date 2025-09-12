import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshAccessTokenDto {
  @ApiProperty({
    description: 'Refresh token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoieW91c3NlZmhhc3NhbmVpbjE3QGdtYWlsLmNvbSIsIm1vYmlsZU51bWJlciI6IisyMDEwMTU0MTEzMjAiLCJyb2xlIjoiUEFUSUVOVCIsImlhdCI6MTc1NzYxODE2MSwiZXhwIjoxNzU3NjE4MTYyLCJhdWQiOiJtb21lbnQtYXBwLWZyb250ZW5kIiwiaXNzIjoibW9tZW50LWFwcC1iYWNrZW5kIn0.EyUjvZCM87sEiUrIPZSc79n-FkmGdQaB126O5Amj37g',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
