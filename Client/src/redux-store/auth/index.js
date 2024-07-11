import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    account: {
        id:1,
        username:"dogukan",
        token:"",
    },   
}

const auth = createSlice({
    name : "auth",
    initialState,
    reducers:{
        _addAccounts:(state,action)=>{
            state.account = action.payload;
        },
        _removeAccount:(state, action)=>{
            this._setAccount(false);
        },
        _setAccount:(state, action)=>{
            state.currentAccount = action.payload;
        }
    }
})

export const {
    _addAccounts,
    _removeAccount,
    _setAccount
} = auth.actions

export default auth.reducer