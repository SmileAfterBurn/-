export interface Organization {
  id: string;
  name: string; // Відповідає колонці "Актори"
  address: string;
  lat: number;
  lng: number;
  category: string;
  services: string; // Відповідає колонці "Послуги"
  phone: string;    // Нове поле
  email: string;    // Нове поле
  status: 'Active' | 'Inactive' | 'Pending';
  driveFolderUrl: string;
  budget: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum ViewMode {
  Grid = 'grid',
  Map = 'map',
  Split = 'split'
}