export enum Role {
  ADMIN = 'ADMIN',
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
}

export enum Language {
  ENGLISH = 'ENGLISH',
  ARABIC = 'ARABIC',
}

export enum VitalSignsTypes {
  SYSTOLIC_PRESSURE = 'SYSTOLIC_PRESSURE',
  DIASTOLIC_PRESSURE = 'DIASTOLIC_PRESSURE',
  BLOOD_GLUCOSE_FASTING = 'BLOOD_GLUCOSE_FASTING',
  BLOOD_GLUCOSE_POSTPRANDIAL = 'BLOOD_GLUCOSE_POSTPRANDIAL',
  HEIGHT = 'HEIGHT',
  WEIGHT = 'WEIGHT',
  HEART_RATE = 'HEART_RATE',
  AGE = 'AGE',
  BODY_MASS_INDEX = 'BODY_MASS_INDEX',
}

export enum VitalSignUnits {
  MMHG = 'mmHg', // Blood pressure
  MG_DL = 'mg/dL', // Blood glucose
  CM = 'cm', // Height
  KG = 'kg', // Weight
  BPM = 'bpm', // Heart rate
  YEARS = 'years', // Age
  KG_MM = 'kg/(m*m)', // Body mass index
}
