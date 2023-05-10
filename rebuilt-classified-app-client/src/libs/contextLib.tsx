import { useContext, createContext, Context } from "react";

export const AppContext: Context<any> = createContext<any>(null);

export function useAppContext() {
    return useContext(AppContext);
}