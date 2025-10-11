export interface DashboardMetrics {
  totalSeats: number;
  occupancyPercentage: number;
  currentRevenue: number;
  seatMap: SeatStatus[];
}

export interface SeatStatus {
  id: string;
  seatNumber: string;
  xCoord: number;
  yCoord: number;
  status: 'available' | 'occupied' | 'reserved';
}
