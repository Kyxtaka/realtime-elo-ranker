/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty, Matches} from 'class-validator';

// DTO pour creation de joueur, renvoie erruer 400 si id non valide
export class CreatePlayerDto {
    @IsString({message: "L'identifiant du joueur n'est pas valide"})
    @IsNotEmpty({message: "L'identifiant du joueur n'est pas valide"})
    @Matches(/^[a-zA-Z0-9-_]{3,30}$/, {message: "L'identifiant du joueur n'est pas valide"}) 
    id: string;
}