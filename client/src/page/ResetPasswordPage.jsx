import ResetPassword from "@/components/auth/reset-password";
function ResetPasswordPage() {
  return (
    <div className="min-h-screen w-full relative">
  {/* Radial Gradient Background from Bottom */}
  <div
    className="absolute inset-0 z-0"
    style={{
      background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #475569 100%)",
    }}
  />
  {/* Your Content/Components */}
  <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10 relative z-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <ResetPassword />
      </div>
    </div>
</div>
  );
}
export default ResetPasswordPage;
