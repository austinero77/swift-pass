
export enum TicketType {
  INDIVIDUAL = 'Individual',
  FAMILY = 'Family'
}

export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  ticketType: TicketType;
  familySize: number;
  pricePerTicket: number;
  discount: number;
  totalPrice: number;
  registrationDate: string;
  isVerified: boolean;
}

export interface AppState {
  participants: Participant[];
  isAdmin: boolean;
}
