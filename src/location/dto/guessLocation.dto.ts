import { IsNumber, IsString } from 'class-validator';

export class GuessLocationDto {
  @IsString()
  id: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

//sadrzi podatke koje korisnik salje
