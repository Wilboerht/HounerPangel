export interface BudgetItem {
  name: string;
  range: string;
  note: string;
}

export interface ItineraryEvent {
  time: string;
  content: string;
  type?: 'location' | 'food' | 'transport' | 'stay' | 'other';
  price?: string;
}

export interface DailyItinerary {
  day: number;
  title: string;
  tocTitle: string;
  route: string;
  events: ItineraryEvent[];
  daySummary?: string;
}

export interface Attraction {
  name: string;
  location: string;
  description: string;
}

export interface FoodItem {
  type: string;
  name: string;
  location: string;
  price: string;
  rowSpan?: number;
}

export interface TravelPlan {
  title: string;
  icon?: string;
  slug: string;
  subtitle: string;
  description: string;
  budget: BudgetItem[];
  itinerary: DailyItinerary[];
  attractions: Attraction[];
  foods: FoodItem[];
  summary: {
    total: string;
    note: string;
    details: {
      label: string;
      value: string;
      icon: 'Train' | 'MapPin' | 'Calendar' | 'Ticket' | 'Utensils' | 'Wallet';
    }[];
  };
}
