import logoAcai from "@/assets/logo-acai.jpg";

export function Header() {
  return (
    <header className="gradient-header sticky top-0 z-40 py-4 px-4">
      <div className="flex flex-col items-center justify-center">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-acai-yellow shadow-lg mb-2">
          <img
            src={logoAcai}
            alt="Açaí das Amigas"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-acai-lilac-light text-sm font-medium">
          Cardápio Digital
        </p>
      </div>
    </header>
  );
}
