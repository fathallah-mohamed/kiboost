import { AuthForm } from "@/components/auth/AuthForm";
import { Link } from "react-router-dom";

const Auth = () => {
  return (
    <div className="min-h-screen bg-[#FFF5E4] flex flex-col items-center justify-center p-4">
      <Link 
        to="/" 
        className="absolute top-4 left-4 text-primary hover:underline"
      >
        ← Retour à l'accueil
      </Link>
      <AuthForm />
    </div>
  );
};

export default Auth;