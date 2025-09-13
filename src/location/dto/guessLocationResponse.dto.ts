export interface GuessLocationResponseDto {
  guessId: string;
  distance: number;
  latitude: number;
  longitude: number;
  locationId: string;
  pointsDeduct: number;
  userPointsAfter: number;
}
