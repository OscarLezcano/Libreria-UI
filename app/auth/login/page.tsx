import LoginForm from './components/LoginForm';
import Image from "next/image";
import LoginImage from "./assets/login-image.png";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <div id="left" className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md p-4">
          <h1 className="text-2xl font-bold mb-2">Bienvenido de nuevo</h1>
          <p className="text-gray-600 mb-4">Ingresá a tu cuenta para comprar y alquilar libros electrónicos.</p>
          <LoginForm />
          <div className="mt-4 flex items-center justify-center">
            <p className="text-gray-600 text-sm">¿No tienes una cuenta?  <a href="/register" className="link link-primary">Regístrate aquí</a></p>
          </div>
        </div>
      </div>
      <div id="right" className="flex-1/10 bg-gray-100 relative">
        <Image src={LoginImage} alt="Hello World" fill loading="eager" sizes="50vw" className="object-cover" />
      </div>
    </div>
  );
}
