import React from 'react';

interface BackgroundProps {
  src: string;
  children: React.ReactNode;
  overlayOpacity?: number;   // 0 a 100
  vignetteOpacity?: number;  // 0 a 100
  glowOpacity?: number;      // 0 a 100
  brightness?: number;       // em % (ex: 70)
  saturation?: number;       // em % (ex: 80)
  scale?: number;            // 1.0, 1.1, etc
}

export const BackgroundImageTreatment: React.FC<BackgroundProps> = ({
  src,
  children,
  overlayOpacity = 70,
  vignetteOpacity = 85,
  glowOpacity = 35,
  brightness = 65,
  saturation = 80,
  scale = 1.02
}) => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#05111B] rounded-[24px]">
      {/* CAMADA 1: IMAGEM BASE COM TRATAMENTO DE FILTRO */}
      <div className="absolute inset-0 z-0">
        <img
          src={src}
          alt="Background"
          className="w-full h-full object-cover object-bottom transition-all duration-700"
          style={{
            filter: `brightness(${brightness}%) saturate(${saturation}%) contrast(110%)`,
            transform: `scale(${scale})`,
          }}
        />
      </div>

      {/* CAMADA 2: OVERLAY OCEÂNICO (AZUL PETRÓLEO) */}
      <div 
        className="absolute inset-0 z-[1] pointer-events-none mix-blend-multiply transition-opacity duration-700"
        style={{ 
          backgroundColor: '#061B2B', 
          opacity: overlayOpacity / 100 
        }}
      />

      {/* CAMADA 3: GRADIENTE DE PROFUNDIDADE (BOTTOM TO TOP) */}
      <div className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-t from-[#05111B] via-transparent to-transparent opacity-90" />

      {/* CAMADA 4: VINHETA ÓPTICA NAS BORDAS */}
      <div 
        className="absolute inset-0 z-[3] pointer-events-none transition-opacity duration-700"
        style={{ 
          background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.8) 100%)',
          opacity: vignetteOpacity / 100
        }}
      />

      {/* CAMADA 5: GLOW DIFUSO (BLOOM) NA BASE */}
      <div 
        className="absolute inset-0 z-[4] pointer-events-none transition-opacity duration-700"
        style={{ 
          background: 'radial-gradient(circle at 50% 90%, rgba(34,211,238,0.15) 0%, transparent 60%)',
          opacity: glowOpacity / 100
        }}
      />

      {/* CAMADA 6: CONTEÚDO DO APP (SLOT) */}
      <div className="relative z-10 w-full h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
};
