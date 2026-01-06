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
export enum educationTopicsTypes {
  video = 'video',
  article = 'article',
  image = 'image',
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

export enum CloudinaryFolders {
  BASE_FOLDER = 'MOMent Project',
  PATIENTS = 'Patients',
  REPORTS = 'Reports',
}

export enum ReportsType {
  LAB = 'Lab',
  RAD = 'Rad',
}

export enum ReportsExtension {
  JPG = 'jpg',
  PNG = 'png',
  PDF = 'pdf',
}

export enum Environment {
  PROD = 'prod',
  DEV = 'dev',
  TEST = 'test',
}

export enum DashboardVitalSignsPeriod {
  WEEKS_1 = 'Past 1 week',
  WEEKS_2 = 'Past 2 weeks',
  WEEKS_3 = 'Past 3 weeks',
  WEEKS_4 = 'Past 4 weeks',
  WEEKS_5 = 'Past 5 weeks',
  WEEKS_6 = 'Past 6 weeks',
  WEEKS_7 = 'Past 7 weeks',
  WEEKS_8 = 'Past 8 weeks',
  WEEKS_9 = 'Past 9 weeks',
  WEEKS_10 = 'Past 10 weeks',
  WEEKS_11 = 'Past 11 weeks',
  WEEKS_12 = 'Past 12 weeks',
}

export enum AllergiesTypes {
  FOOD = 'Food',
  DRUG = 'Drug',
}
