"use client";
import AuthLayout from "@/components/auth/AuthLayout";
import Login from "@/components/auth/Login";

function LoginPage() {
  return (
    <div>
      <AuthLayout className="justify-center">
       <Login />
      </AuthLayout>
    </div>
  );
}

export default LoginPage;
