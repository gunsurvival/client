import {type Item, type Inventory} from '@gunsurvival/core';
import {createSlice} from '@reduxjs/toolkit';

export type IItem = {
	id: string;
	amount: number;
};

export type IItemBarState = {
	choosing: number[];
	items: IItem[];
};

export const itemBarSlice = createSlice({
	name: 'itemBarSlice',
	initialState: {
		choosing: [0],
		items: new Array<IItem>(4).fill({id: 'ak47', amount: 1}),
	},
	reducers: {
		choose(state: IItemBarState, action: {payload: number[]}) {
			state.choosing = action.payload;
		},
		updateItems(state: IItemBarState, action: {payload: IItem[]}) {
			state.items = action.payload;
		},
	},
});

export const {choose} = itemBarSlice.actions;
export default itemBarSlice.reducer;
