import { Organization } from './types';

export const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1ev98ifed1h8xc16KcWaOmvaky8I9StuE0-6w7UPG4K4/edit?gid=1212063265#gid=1212063265';
export const DRIVE_URL = 'https://drive.google.com/drive/folders/1kSQKI_-2b8mmWfUw5ZHvGaDD9g4tPWqU?usp=sharing';

// Дані для Одеської, Миколаївської та Херсонської областей
export const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: '1',
    name: 'БФ "Корпорація Монстрів"',
    address: 'вул. Пантелеймонівська, 21, Одеса',
    lat: 46.4694,
    lng: 30.7404,
    category: 'Благодійний фонд',
    services: 'Гуманітарна допомога, медичне забезпечення лікарень, допомога ВПО, адресна допомога дітям.',
    phone: '+380 99 123 4567',
    email: 'info@monsters.org.ua',
    status: 'Active',
    driveFolderUrl: DRIVE_URL,
    budget: 25000000
  },
  {
    id: '2',
    name: 'Гуманітарний штаб "Миколаїв"',
    address: 'вул. Нікольська, 25, Миколаїв',
    lat: 46.9750,
    lng: 31.9946,
    category: 'Волонтерський штаб',
    services: 'Роздача продуктових наборів, забезпечення питною водою, евакуація населення.',
    phone: '+380 63 987 6543',
    email: 'help@mykolaiv.volunteer',
    status: 'Active',
    driveFolderUrl: DRIVE_URL,
    budget: 12500000
  },
  {
    id: '3',
    name: 'Херсонський Хаб "Я - Херсон"',
    address: 'пл. Свободи, 1, Херсон',
    lat: 46.6354,
    lng: 32.6169,
    category: 'Громадська організація',
    services: 'Психологічна підтримка, юридичні консультації, відновлення документів, шелтер.',
    phone: '+380 50 555 0101',
    email: 'support@kherson.hub',
    status: 'Active',
    driveFolderUrl: DRIVE_URL,
    budget: 8100000
  },
  {
    id: '4',
    name: 'Карітас Одеса УГКЦ',
    address: 'вул. Південна, 40, Одеса',
    lat: 46.4580,
    lng: 30.7100,
    category: 'Релігійна місія',
    services: 'Догляд вдома, робота з дітьми та молоддю, кризовий центр, гуманітарна допомога.',
    phone: '+380 48 777 8899',
    email: 'caritas@odessa.ugcc',
    status: 'Active',
    driveFolderUrl: DRIVE_URL,
    budget: 18000000
  },
  {
    id: '5',
    name: 'Червоний Хрест Миколаївщини',
    address: 'пр. Центральний, 12, Миколаїв',
    lat: 46.9660,
    lng: 32.0000,
    category: 'Міжнародна організація',
    services: 'Навчання першій допомозі, видача ваучерів, підтримка літніх людей.',
    phone: '+380 512 34 56 78',
    email: 'mk@redcross.org.ua',
    status: 'Active',
    driveFolderUrl: DRIVE_URL,
    budget: 30000000
  },
  {
    id: '6',
    name: 'Волонтерський центр "Корабельний"',
    address: 'Корабельний район, Херсон',
    lat: 46.6100,
    lng: 32.5800,
    category: 'Волонтерський пункт',
    services: 'Гаряче харчування, пункти обігріву, допомога з будматеріалами.',
    phone: '+380 66 222 3344',
    email: 'korabelny@volunteer.ks',
    status: 'Pending',
    driveFolderUrl: DRIVE_URL,
    budget: 950000
  },
  {
    id: '7',
    name: 'БФ "ПОСМІШКА ЮА" (Одеса)',
    address: 'м. Одеса, Одеська область',
    lat: 46.4825,
    lng: 30.7233,
    category: 'Благодійний фонд',
    services: 'Всі види допомоги (гуманітарна, психологічна, соціальна)',
    phone: '+380 50 460 2240',
    email: 'contact@posmishka.org.ua',
    status: 'Active',
    driveFolderUrl: DRIVE_URL,
    budget: 100000000
  },
  {
    id: '8',
    name: 'БФ "ПОСМІШКА ЮА" (Миколаїв)',
    address: 'м. Миколаїв, Миколаївська область',
    lat: 46.9600,
    lng: 32.0100,
    category: 'Благодійний фонд',
    services: 'Всі види допомоги (гуманітарна, психологічна, соціальна)',
    phone: '+380 50 460 2240',
    email: 'contact@posmishka.org.ua',
    status: 'Active',
    driveFolderUrl: DRIVE_URL,
    budget: 100000000
  },
  {
    id: '9',
    name: 'БФ "ПОСМІШКА ЮА" (Херсон)',
    address: 'м. Херсон, Херсонська область',
    lat: 46.6400,
    lng: 32.6100,
    category: 'Благодійний фонд',
    services: 'Всі види допомоги (гуманітарна, психологічна, соціальна)',
    phone: '+380 50 460 2240',
    email: 'contact@posmishka.org.ua',
    status: 'Active',
    driveFolderUrl: DRIVE_URL,
    budget: 100000000
  }
];