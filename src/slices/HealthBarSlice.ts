import {createSlice} from '@reduxjs/toolkit';

export type IHealthBarState = {
	health: number;
};

export const heathBarSlice = createSlice({
	name: 'heathBarSlice',
	initialState: {
		health: 100,
	},
	reducers: {
		setHealth(state: IHealthBarState, action: {payload: number}) {
			state.health = action.payload;
		},
	},
});

export const {setHealth} = heathBarSlice.actions;
export default heathBarSlice.reducer;
