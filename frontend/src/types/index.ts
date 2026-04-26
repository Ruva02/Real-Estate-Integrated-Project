export interface Property {
    _id: string;
    title: string;
    city: string;
    price: number;
    bedrooms: number;
    area_sqft?: number;
    description?: string;
    image?: string;
    action: 'Buy' | 'Rent' | 'Sell';
    listed_by?: string;
    created_at?: string;
}

export interface Quiz {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
}

export interface Message {
    id: string;
    type: 'user' | 'agent';
    text: string;
    timestamp: Date;
    properties?: Property[];
    quiz?: Quiz;
    options?: string[];
}
