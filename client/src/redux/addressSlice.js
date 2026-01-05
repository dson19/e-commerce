import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/services/api';

export const fetchAddresses = createAsyncThunk(
    'address/fetchAddresses',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authService.getAddresses();
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể lấy danh sách địa chỉ');
        }
    }
);

export const addAddressThunk = createAsyncThunk(
    'address/addAddress',
    async (addressData, { rejectWithValue }) => {
        try {
            const response = await authService.addAddress(addressData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể thêm địa chỉ');
        }
    }
);

export const updateAddressThunk = createAsyncThunk(
    'address/updateAddress',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await authService.updateAddress(id, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật địa chỉ');
        }
    }
);

export const deleteAddressThunk = createAsyncThunk(
    'address/deleteAddress',
    async (id, { rejectWithValue }) => {
        try {
            await authService.deleteAddress(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể xóa địa chỉ');
        }
    }
);

const addressSlice = createSlice({
    name: 'address',
    initialState: {
        list: JSON.parse(localStorage.getItem('addresses')) || [],
        loading: false,
        error: null
    },
    reducers: {
        removeAddress: (state, action) => {
            state.list = state.list.filter((addr) => addr.address_id !== action.payload);
            localStorage.setItem('addresses', JSON.stringify(state.list));
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAddresses.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAddresses.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
                localStorage.setItem('addresses', JSON.stringify(state.list));
            })
            .addCase(fetchAddresses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(addAddressThunk.fulfilled, (state, action) => {
                const newAddress = action.payload;
                if (newAddress.is_default) {
                    state.list = state.list.map(addr => ({ ...addr, is_default: false }));
                }
                state.list.push(newAddress);
                localStorage.setItem('addresses', JSON.stringify(state.list));
            })
            .addCase(updateAddressThunk.fulfilled, (state, action) => {
                const updatedAddress = action.payload;
                if (updatedAddress.is_default) {
                    state.list = state.list.map(addr =>
                        addr.address_id === updatedAddress.address_id ? updatedAddress : { ...addr, is_default: false }
                    );
                } else {
                    const index = state.list.findIndex(addr => addr.address_id === updatedAddress.address_id);
                    if (index !== -1) {
                        state.list[index] = updatedAddress;
                    }
                }
                localStorage.setItem('addresses', JSON.stringify(state.list));
            })
            .addCase(deleteAddressThunk.fulfilled, (state, action) => {
                state.list = state.list.filter(addr => addr.address_id !== action.payload);
                localStorage.setItem('addresses', JSON.stringify(state.list));
            });
    },
});

export const { removeAddress } = addressSlice.actions;
export default addressSlice.reducer;