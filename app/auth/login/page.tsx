import LoginForm from '../../../common/components/LoginForm';
import Image from "next/image";
import Link from "next/link";
import LoginImage from "../../../public/images/login-image.png";

interface LoginPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { reason } = await searchParams;

  return (
    <div className="flex min-h-screen">
      <div id="left" className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md p-4">
          <h1 className="text-2xl font-bold mb-2">Bienvenido de nuevo</h1>
          <p className="text-gray-600 mb-4">Ingresá a tu cuenta para comprar libros.</p>
          <LoginForm authRequiredNotice={reason === "auth-required"} />
          <div className="mt-4 flex items-center justify-center">
            <p className="text-gray-600 text-sm">
              ¿No tienes una cuenta?{" "}
              <Link href="/auth/register" className="link link-primary">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div id="right" className="flex-1/10 bg-gray-100 relative">
        <Image src={LoginImage} alt="Hello World" fill loading="eager" sizes="99vw" className="object-cover" />
      </div>
    </div>
  );
}
