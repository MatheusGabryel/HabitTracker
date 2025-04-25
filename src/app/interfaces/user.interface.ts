export interface UserData {
    uid: string;
    email: string;
    displayName: string;
    createdAt?: Date;
    bio?: string;
    phoneNumber?: string;
    birthday?: string;
    photoURL?: string;
    gender?: string;
    location?: string;
    habits?: {
        id: string,
        nome: string,
        categoria: string,
        duracao?: string,
        horaInicio?: string,
        horaFim?: string,
        vezesPorDia?: string,
        dias: string[],
        descricao?: string,
        prioridade: string,
    };
}