import AuthLayout from "@/components/auth/AuthLayout";
import Login from "@/components/auth/Login";

function page() {
  return (
    <div>
      <AuthLayout>
       <Login />
      </AuthLayout>
    </div>
  );
}

export default page;
