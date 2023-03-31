import {createSlice} from '@reduxjs/toolkit';

export type IItemBarState = {
	choosing: number;
	amount: number;
	items: [];
};

export const itemBarSlice = createSlice({
	name: 'itemBarSlice',
	initialState: {
		choosing: 0,
		amount: 4,
		items: new Array(4).fill(undefined),
	},
	reducers: {
		choose(state: IItemBarState, action: {payload: number}) {
			state.choosing = action.payload;
		},
		remove(state: IItemBarState, action: {payload: number}) {
			state.
		}
	},
});

export const {choose} = itemBarSlice.actions;
export default itemBarSlice.reducer;
