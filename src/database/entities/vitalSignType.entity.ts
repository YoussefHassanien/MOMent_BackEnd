import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VitalSignsTypes, VitalSignUnits } from '../../constants/enums';
import { VitalSign } from './vitalSign.entity';

@Entity('Vital-Sign-Types')
export class VitalSignType {
  @PrimaryGeneratedColumn()
  @IsInt()
  @IsPositive()
  id: number;

  @Column({ unique: true })
  @Generated('uuid')
  @IsString()
  @IsUUID()
  globalId: string;

  @Column({ type: 'enum', enum: VitalSignsTypes })
  @IsEnum(VitalSignsTypes)
  type: VitalSignsTypes;

  @Column('float')
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  minValidValue: number;

  @Column('float')
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  maxValidValue: number;

  @Column('float')
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  highValueAlert: number;

  @Column('float')
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  lowValueAlert: number;

  @Column({ type: 'enum', enum: VitalSignUnits })
  @IsEnum(VitalSignUnits)
  unit: VitalSignUnits;

  @OneToMany(() => VitalSign, (vitalSign) => vitalSign.vitalSignType)
  vitalSigns: VitalSign[];

  @CreateDateColumn()
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;
}
