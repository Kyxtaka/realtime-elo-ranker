/* eslint-disable prettier/prettier */
export interface ErrorInterface {
    code?: number; // Pour l'instant ne gere que les errur http mais on peut imaginer d'autres types d'erreurs
    message: string;

    getError(): { code: number; message: string };
}