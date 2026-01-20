/* eslint-disable prettier/prettier */
import { IsString, Matches, IsNotEmpty, IsAlphanumeric, IsBoolean } from "class-validator"; 

export class CreateMatchDto {
    @IsString({message: "L'identifiant du joueur gagnant n'est pas valide"})
    @IsNotEmpty({message: "L'identifiant du joueur gagnant n'est pas valide"})
    @Matches(/^[a-zA-Z0-9-_]{3,30}$/, {message: "L'identifiant du joueur gagnant n'est pas valide"}) 
    winner: string;

    @IsString({message: "L'identifiant du joueur perdant n'est pas valide"})
    @IsNotEmpty({message: "L'identifiant du joueur perdant n'est pas valide"})
    @Matches(/^[a-zA-Z0-9-_]{3,30}$/, {message: "L'identifiant du joueur perdant n'est pas valide"})
    loser: string;
    
    @IsNotEmpty({message: "Le résultat du match n'est pas valide"})
    @IsBoolean({message: "Le résultat du match n'est pas valide"})
    draw: boolean;
}