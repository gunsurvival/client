import {createSlice} from '@reduxjs/toolkit';

export type IItemBarState = {
	choosing: number;
	amount: number;
};

export const itemBarSlice = createSlice({
	name: 'itemBarSlice',
	initialState: {
		choosing: 0,
		amount: 4,
	},
	reducers: {
		choose(state: IItemBarState, action: {payload: number}) {
			state.choosing = action.payload;
		},
	},
});

export const {choose} = itemBarSlice.actions;
export default itemBarSlice.reducer;
