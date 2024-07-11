import { _setAccount } from ".";
import store from "..";

export const setAccount = data => store.dispatch(_setAccount(data))