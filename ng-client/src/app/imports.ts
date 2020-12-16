export interface RegistrationData {
  name: string,
  passwd: string,
  deposit: number
}

export interface LoginData {
  id: string,
  passwd: string
}

export interface UserInfo {
  name: string,
  accountId: string
}

export const tr_types: string[] = ['','withdrawal','deposit','transfer'];

export const TRANSFER: string = "Transfer";
export const TRANSACTIONS: string = "Transactions";
export const DEPOSIT: string = "Deposit";
export const WITHDRAWAL: string = "Withdrawal";
export const BALANCE: string = "Balance";
export const LOGIN: string = "Login";
export const REGISTRATION: string = "Registration";

export function isValidSum(sum: string): boolean {
  let sumAsNum: number = Number(sum);
  if (isNaN(sumAsNum) || sumAsNum <= 0) {
    return false;
  }
  return true;
}
