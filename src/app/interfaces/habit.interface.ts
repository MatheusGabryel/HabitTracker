export interface HabitData {
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
}