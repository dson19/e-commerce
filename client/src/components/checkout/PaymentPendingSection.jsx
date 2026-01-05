import React from 'react';

const PaymentPendingSection = ({ order }) => {
    if (!order) return null;

    return (
        <div className="bg-white rounded-2xl border-2 border-[#004535] shadow-lg p-8 text-center animate-in zoom-in duration-500 relative overflow-hidden">
            <h3 className="font-bold text-[#004535] text-xl mb-6 flex items-center justify-center gap-2">
                Quét mã để thanh toán
            </h3>
            <div className="bg-white p-2 rounded-xl border border-gray-200 inline-block mb-6 shadow-sm">
                <img
                    src={`https://img.vietqr.io/image/MB-0398277699-compact2.png?amount=${order.grand_total}&addInfo=${encodeURIComponent(`Order ID ${order.order_id}`)}&accountName=Dang%20Hoang%20Son`}
                    alt="VietQR Payment"
                    className="w-56 h-auto mx-auto"
                />
            </div>
            <div className="space-y-2 text-sm">
                <p className="text-gray-500">Ngân hàng: <span className="font-bold text-gray-800 text-base">MBBank (Quân Đội)</span></p>
                <p className="text-gray-500">Số tài khoản: <span className="font-bold text-gray-800 text-base copy-text cursor-pointer hover:text-[#004535]" title="Sao chép">0398277699</span></p>
                <p className="text-gray-500">Chủ tài khoản: <span className="font-bold text-gray-800 text-base uppercase">DANG HOANG SON</span></p>
                <p className="text-gray-500">Nội dung: <span className="font-bold text-gray-800 text-base">Order ID : {order.order_id}</span></p>
            </div>
            <div className="mt-6 p-4 bg-blue-50 text-blue-700 rounded-xl text-sm italic">
                💡 Sau khi chuyển khoản, hệ thống sẽ tự động cập nhật trạng thái đơn hàng (vài phút).
            </div>
        </div>
    );
};

export default PaymentPendingSection;   
