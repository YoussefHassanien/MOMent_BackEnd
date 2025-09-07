import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Generated,
} from 'typeorm';
import { VitalSign } from './vitalSign.entity';
import { VitalSignsTypes, VitalSignUnits } from '../../constants/enums';
import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsDate,
  IsInt,
  IsPositive,
  IsUUID,
  IsNumber,
} from 'class-validator';

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
