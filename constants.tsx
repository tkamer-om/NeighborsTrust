import { ServiceProvider, ServiceCategory } from './types.ts';

export const INITIAL_DATA: ServiceProvider[] = [
  {
    id: 'init-1',
    name: 'יוסי דהן',
    category: ServiceCategory.PLUMBER,
    phone: '052-1234567',
    description: 'אינסטלטור מוסמך, מומחה לאיתור נזילות',
    recommendations: [
      {
        id: 'rec-1',
        recommenderName: 'מיכל',
        comment: 'הגיע מהר מאוד בערב שבת ופתר את הבעיה בצורה מקצועית.',
        date: '2024-05-15'
      }
    ]
  },
  {
    id: 'init-2',
    name: 'ד"ר רחל לוי',
    category: ServiceCategory.MEDICAL,
    phone: '03-6789000',
    description: 'רופאת ילדים ומומחית להתפתחות הילד',
    recommendations: [
      {
        id: 'rec-2',
        recommenderName: 'דנה',
        comment: 'מקצועית, סבלנית ומרגיעה מאוד את הילדים.',
        date: '2024-05-10'
      }
    ]
  }
];

export const CATEGORIES = Object.values(ServiceCategory);