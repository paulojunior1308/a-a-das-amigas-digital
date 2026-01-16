import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";
import { Camera, CameraOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

export default function QRCodeScanner({ onScanSuccess, onScanError }: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanning = async () => {
    setError(null);
    
    try {
      // Check for camera permissions
      const devices = await Html5Qrcode.getCameras();
      
      if (devices.length === 0) {
        setHasCamera(false);
        setError("Nenhuma câmera encontrada no dispositivo");
        return;
      }

      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" }, // Use back camera if available
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Success callback
          onScanSuccess(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // Error callback (ignore frame decode errors)
          if (!errorMessage.includes("NotFoundException")) {
            console.log("QR scan error:", errorMessage);
          }
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
      const errorMessage = err instanceof Error ? err.message : "Erro ao acessar a câmera";
      
      if (errorMessage.includes("Permission denied") || errorMessage.includes("NotAllowedError")) {
        setError("Permissão de câmera negada. Por favor, permita o acesso à câmera.");
      } else {
        setError(errorMessage);
      }
      
      setHasCamera(false);
      onScanError?.(errorMessage);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.log("Error stopping scanner:", err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div 
        ref={containerRef}
        className="relative bg-secondary/50 rounded-xl overflow-hidden"
        style={{ minHeight: "280px" }}
      >
        {/* QR Reader container */}
        <div 
          id="qr-reader" 
          className={`w-full ${isScanning ? "" : "hidden"}`}
          style={{ minHeight: "280px" }}
        />

        {/* Placeholder when not scanning */}
        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            {error ? (
              <>
                <AlertCircle className="w-12 h-12 text-destructive mb-3" />
                <p className="text-sm text-destructive text-center mb-4">{error}</p>
                <Button
                  onClick={startScanning}
                  variant="outline"
                  size="sm"
                >
                  Tentar Novamente
                </Button>
              </>
            ) : hasCamera ? (
              <>
                <Camera className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Clique para iniciar a câmera e escanear o QR Code
                </p>
                <Button
                  onClick={startScanning}
                  className="bg-primary text-primary-foreground"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Iniciar Câmera
                </Button>
              </>
            ) : (
              <>
                <CameraOff className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground text-center">
                  Câmera não disponível. Use o campo abaixo para digitar o número da comanda.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {isScanning && (
        <Button
          onClick={stopScanning}
          variant="outline"
          className="w-full"
        >
          <CameraOff className="w-4 h-4 mr-2" />
          Parar Câmera
        </Button>
      )}
    </div>
  );
}
