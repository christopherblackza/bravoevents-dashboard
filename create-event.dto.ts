import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsMongoId, ValidateNested } from 'class-validator';
import { PermissionsDto } from './permissions.dto';
import { InfrastructureDto } from './infrastructure.dto';
import { DecorationDto } from './decoration.dto';
import { SanitationDto } from './sanitation.dto';
import { SafetyDto } from './safety.dto';
import { CampingDto } from './camping.dto';
import { VendorsStallsDto } from './vendors-stalls.dto';
import { SeatingDto } from './seating.dto';
import { BeveragesBarServicesDto } from './beverages-bar-services.dto';
import { BrandingPromotionDto } from './branding-promotion.dto';
import { AccreditationEntryDto } from './accreditation-entry.dto';
import { StaffingSupportDto } from './staffing-support.dto';
import { TransportDto } from './transport.dto';

export class CreateEventDto {
  @ApiProperty() title: string;
  @ApiProperty() date: Date;
  @ApiProperty() startTime: string;
  @ApiProperty() endTime: string;
  @ApiProperty() city: string;
  @ApiProperty() location: string;
  @ApiProperty() eventLogo: string;
  @ApiProperty() isEventVenue: boolean;
  @ApiProperty() venueServiceId: string;
  @ApiProperty() ticketUrl: string;
  @ApiProperty() eventImageUrls: [string];
  @ApiProperty() eventDescription: string;
  @ApiProperty() requestTickets: boolean;

  @ApiProperty()
  eventTypeId: string;

  @ApiProperty()
  otherEventType: string;

  @ApiProperty()
  expectedPeople: number;

  @ApiProperty()
  servicePrice: number;

  @ApiProperty({ default: 500 })
  adminFee: number;

  @ApiProperty({ description: 'Return URL after successful payment' })
  returnUrl?: string;

  @ApiProperty({ description: 'Cancel URL after payment cancellation' })
  cancelUrl?: string;

  @ApiProperty()
  @IsMongoId()
  userId: string;

  @ApiProperty({ type: TransportDto })
  @ValidateNested()
  @Type(() => TransportDto)
  transport: TransportDto;

  @ApiProperty({ type: SeatingDto })
  @ValidateNested()
  @Type(() => SeatingDto)
  seatingArrangement: SeatingDto;

  @ApiProperty({ type: PermissionsDto })
  @ValidateNested()
  @Type(() => PermissionsDto)
  permissions: PermissionsDto;

  @ApiProperty({ type: InfrastructureDto })
  @ValidateNested()
  @Type(() => InfrastructureDto)
  infrastructure: InfrastructureDto;

  @ApiProperty({ type: DecorationDto })
  @ValidateNested()
  @Type(() => DecorationDto)
  decoration: DecorationDto;

  @ApiProperty({ type: SanitationDto })
  @ValidateNested()
  @Type(() => SanitationDto)
  sanitation: SanitationDto;

  @ApiProperty({ type: SafetyDto })
  @ValidateNested()
  @Type(() => SafetyDto)
  safety: SafetyDto;

  @ApiProperty({ type: CampingDto })
  @ValidateNested()
  @Type(() => CampingDto)
  camping: CampingDto;

  @ApiProperty({ type: VendorsStallsDto })
  @ValidateNested()
  @Type(() => VendorsStallsDto)
  vendorsStalls: VendorsStallsDto;

  @ApiProperty({ type: BeveragesBarServicesDto })
  @ValidateNested()
  @Type(() => BeveragesBarServicesDto)
  beveragesBarServices: BeveragesBarServicesDto;

  @ApiProperty({ type: BrandingPromotionDto })
  @ValidateNested()
  @Type(() => BrandingPromotionDto)
  brandingPromotionDto: BrandingPromotionDto;

  @ApiProperty({ type: AccreditationEntryDto })
  @ValidateNested()
  @Type(() => AccreditationEntryDto)
  accreditationEntryDto: AccreditationEntryDto;

  @ApiProperty({ type: StaffingSupportDto })
  @ValidateNested()
  @Type(() => StaffingSupportDto)
  staffingSupportDto: StaffingSupportDto;
}
