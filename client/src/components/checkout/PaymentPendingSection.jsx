import { useState, useEffect } from 'react';

const PaymentPendingSection = ({ order, onTimeout }) => {
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!order || !order.created_at) return;

        const calculateTimeLeft = () => {
            const createdAt = new Date(order.created_at).getTime();
            const now = new Date().getTime();
            // 10 minutes in milliseconds
            const tenMinutes = 10 * 60 * 1000;
            const expiryTime = createdAt + tenMinutes;
            const difference = expiryTime - now;

            if (difference <= 0) {
                return 0;
            }
            return difference;
        };

        // Initial set
        const initialDiff = calculateTimeLeft();
        setTimeLeft(initialDiff);

        // If already expired, trigger immediately? 
        if (initialDiff <= 0 && onTimeout) {
            onTimeout();
            return;
        }

        const timer = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(timer);
                if (onTimeout) onTimeout();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [order, onTimeout]);

    const formatTime = (ms) => {
        if (ms === null) return "--:--";
        if (ms <= 0) return "00:00";
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!order) return null;

    return (
        <div className="bg-white rounded-2xl border-2 border-[#004535] shadow-lg p-8 text-center animate-in zoom-in duration-500 relative overflow-hidden">
            {/* Countdown Badge */}
            <div className={`absolute top-0 right-0 px-4 py-2 rounded-bl-xl font-bold text-white shadow-md ${timeLeft !== null && timeLeft <= 60000 ? 'bg-red-500 animate-pulse' : 'bg-[#004535]'}`}>
                Thời gian còn lại: {formatTime(timeLeft)}
            </div>

            <h3 className="font-bold text-[#004535] text-xl mb-6 flex items-center justify-center gap-2 mt-4">
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
                💡 Sau khi chuyển khoản, hệ thống sẽ tự động cập nhật trạng thái đơn hàng (vài phút).<br />
                Đơn hàng sẽ tự động hủy sau <span className="font-bold text-red-500">10 phút</span> nếu chưa thanh toán.
            </div>
        </div>
    );
};

export default PaymentPendingSection;  
