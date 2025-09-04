export interface GuessLocationResponseDto {
  guessId: string;
  distance: number;
  latitude: number;
  longitude: number;
  locationId: string;
  pointsDeducted: number;
}
