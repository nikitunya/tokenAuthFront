import { AccountType } from "../enums/AccounType.enum";

export interface User {
    id?: number;
    firstName?: string;
    lastName?: string,
    password?: string,
    email?: string,
    phone?: string;
    type?: AccountType;
}