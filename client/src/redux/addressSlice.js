import { createSlice } from '@reduxjs/toolkit';

const addressSlice = createSlice({
    name: 'address',
    initialState: {
        // Đây là nơi lưu trữ danh sách địa chỉ của bạn
        list: JSON.parse(localStorage.getItem('addresses')) || [],
    },
    reducers: {
        // Hàm này sẽ được gọi khi bạn nhấn "Lưu địa chỉ" ở Modal
        addAddress: (state, action) => {
            // action.payload chính là toàn bộ object address từ form của bạn
            state.list.push(action.payload);
            // Lưu thêm vào bộ nhớ trình duyệt
            localStorage.setItem('addresses', JSON.stringify(state.list));
        },

        // Cập nhật địa chỉ cũ
        updateAddress: (state, action) => {
            const { index, address } = action.payload;
            if (index >= 0 && index < state.list.length) {
                state.list[index] = address;
                localStorage.setItem('addresses', JSON.stringify(state.list));
            }
        },

        // Thêm hàm xóa nếu sau này bạn muốn người dùng có thể xóa địa chỉ
        removeAddress: (state, action) => {
            state.list = state.list.filter((_, index) => index !== action.payload);
            localStorage.setItem('addresses', JSON.stringify(state.list));
        },
    },
});

// Xuất các action để sử dụng trong dispatch
export const { addAddress, removeAddress, updateAddress } = addressSlice.actions;

// Xuất reducer để đăng ký vào store
export default addressSlice.reducer;