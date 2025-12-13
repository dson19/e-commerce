import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function OtpModal({ email, isOpen, onClose }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleVerify = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email,
        otp,
      });
      alert("Xác thực thành công!");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Xác thực thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-center">Nhập mã OTP</h2>
        <p className="text-sm text-gray-500 mb-4 text-center">
          Mã xác thực đã được gửi tới <b>{email}</b>
        </p>
        
        {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}

        <Input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Nhập 6 số OTP"
          className="text-center text-lg tracking-widest mb-4"
          maxLength={6}
        />

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Hủy
          </Button>
          <Button className="flex-1" onClick={handleVerify} disabled={loading}>
            {loading ? "Đang kiểm tra..." : "Xác nhận"}
          </Button>
        </div>
      </div>
    </div>
  );
}