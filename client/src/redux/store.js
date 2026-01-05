import { configureStore } from '@reduxjs/toolkit';
import addressReducer from './addressSlice';
import orderReducer from './orderSlice';

export const store = configureStore({
  reducer: {
    address: addressReducer,
    order: orderReducer,
  },
});