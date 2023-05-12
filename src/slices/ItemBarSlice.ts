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
		items: new Array<IItem>(4).fill({id: 'None', amount: 1}),
	},
	reducers: {
		choose(state: IItemBarState, action: {payload: number[]}) {
			state.choosing = [...action.payload];
		},
		updateAll(state: IItemBarState, action: {payload: IItem[]}) {
			state.items = [...action.payload];
		},
		add(state: IItemBarState, action: {payload: {item: IItem; opts: {index: number; isStack: boolean}}}) {
			const {item, opts} = action.payload;
			if (opts.isStack) {
				state.items[opts.index].amount += item.amount;
			} else {
				state.items[opts.index] = {
					id: item.id,
					amount: item.amount,
				};
			}
		},
	},
});

export const {choose, updateAll, add} = itemBarSlice.actions;
export default itemBarSlice.reducer;
