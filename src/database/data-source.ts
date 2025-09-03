import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { OTP } from './entities/otp.entity';
import { Patient } from './entities/patient.entity';
import { VitalSign } from './entities/vital_sign.entity';
import { VitalSignType } from './entities/vital_sign_types.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  entities: [User, OTP, Patient, VitalSign, VitalSignType],
  migrations: ['src/database/migrations/*.js'],
  synchronize: false,
});

AppDataSource.initialize()
  .then(() => {
    console.log('Database connection succeeded');
  })
  .catch((error) => {
    console.log('Database connection failed', error);
  });
