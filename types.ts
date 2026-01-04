
export enum ServiceCategory {
  HANDYMAN = 'הנדימן / תיקונים',
  HAIRSTYLIST = 'עיצוב שיער',
  TEACHER = 'מורה פרטי/ת',
  CLEANER = 'שירותי ניקיון',
  PLUMBER = 'אינסטלטור',
  ELECTRICIAN = 'חשמלאי',
  GARDENER = 'גנן',
  BABYSITTER = 'בייביסיטר',
  DENTAL = 'שיננית / רפואת שיניים',
  BEAUTY = 'קוסמטיקה וטיפוח',
  THERAPY = 'טיפול וייעוץ',
  PETS = 'בעלי חיים / וטרינר',
  TRANSPORT = 'הובלות ומשלוחים',
  FITNESS = 'כושר וספורט',
  MEDICAL = 'רפואה ומומחים',
  OTHER = 'אחר'
}

export interface Recommendation {
  id: string;
  recommenderName: string;
  comment: string;
  date: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  category: ServiceCategory;
  phone: string;
  email?: string;
  description: string;
  recommendations: Recommendation[];
  location?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
