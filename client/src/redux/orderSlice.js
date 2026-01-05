import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '@/services/api';

export const fetchOrderHistory = createAsyncThunk(
    'order/fetchHistory',
    async (_, { rejectWithValue }) => {
        try {
            const response = await orderService.getUserOrderHistory();
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải lịch sử đơn hàng');
        }
    }
);

export const fetchOrderDetail = createAsyncThunk(
    'order/fetchDetail',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await orderService.getOrderById(orderId);
            return response.data.data;
        } catch (error) { 
            return rejectWithValue(error.response?.data?.message || 'Không thể tải chi tiết đơn hàng');
        }
    }
);

export const createOrderThunk = createAsyncThunk(
    'order/create',
    async (orderData, { rejectWithValue }) => {
        try {
            const response = await orderService.createOrder(orderData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tạo đơn hàng');
        }
    }
);

const orderSlice = createSlice({
    name: 'order',
    initialState: {
        history: [],
        currentOrder: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch History
            .addCase(fetchOrderHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.history = action.payload;
            })
            .addCase(fetchOrderHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Detail
            .addCase(fetchOrderDetail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderDetail.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
            })
            .addCase(fetchOrderDetail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create Order
            .addCase(createOrderThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrderThunk.fulfilled, (state) => {
                state.loading = false;
                // We might not need to add the new order to history here 
                // as the user will be redirected to payment page
            })
            .addCase(createOrderThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
