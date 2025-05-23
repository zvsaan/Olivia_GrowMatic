// src/components/monitoring/ControlPanel.tsx
import { useState, useEffect } from "react";
import { setMode, setPumpStatus, setFanStatus, getSensorData } from "../../services/thingerService";

export default function ControlPanel() {
  const [mode, setModeState] = useState<'otomatis' | 'manual'>("otomatis");
  const [fanStatus, setFanStatusState] = useState(false);
  const [pumpStatus, setPumpStatusState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Tambahkan useEffect untuk mengambil status awal dari backend
  useEffect(() => {
    const fetchInitialStatus = async () => {
      try {
        const data = await getSensorData();
        setModeState(data.mode || "otomatis");
        setFanStatusState(data.fanStatus);
        setPumpStatusState(data.pumpStatus);
      } catch (error) {
        console.error("Error fetching initial status:", error);
      }
    };

    fetchInitialStatus();
  }, []);

  const handleModeChange = async (newMode: 'otomatis' | 'manual') => {
    setIsLoading(true);
    try {
      await setMode(newMode);
      setModeState(newMode);
      // Jika berpindah ke auto, update status sesuai dengan yang dikembalikan backend
      if (newMode === 'otomatis') {
        const data = await getSensorData();
        setFanStatusState(data.fanStatus);
        setPumpStatusState(data.pumpStatus);
      }
    } catch (error) {
      console.error("Error changing mode:", error);
      // Tambahkan feedback ke user (toast/alert)
      alert("Failed to change mode. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFanStatusChange = async () => {
    if (mode !== "manual") return;
    
    setIsLoading(true);
    try {
      const newStatus = !fanStatus;
      await setFanStatus(newStatus);
      setFanStatusState(newStatus);
    } catch (error) {
      console.error("Error changing fan status:", error);
      alert("Failed to update fan status");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePumpStatusChange = async () => {
    if (mode !== "manual") return;
    
    setIsLoading(true);
    try {
      const newStatus = !pumpStatus;
      await setPumpStatus(newStatus);
      setPumpStatusState(newStatus);
    } catch (error) {
      console.error("Error changing pump status:", error);
      alert("Failed to update pump status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 pb-6 sm:px-6 sm:pt-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Control Panel {isLoading && <span className="text-sm text-gray-500">(Updating...)</span>}
        </h3>
        
        {/* Mode Selector */}
        <div className="flex gap-4 mt-4 mb-6">
          <button
            onClick={() => handleModeChange("otomatis")}
            disabled={isLoading}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
              mode === "otomatis" 
                ? "bg-blue-100 text-blue-600" 
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Auto Mode
          </button>
          <button
            onClick={() => handleModeChange("manual")}
            disabled={isLoading}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
              mode === "manual" 
                ? "bg-blue-100 text-blue-600" 
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Manual Mode
          </button>
        </div>
        
        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg border ${
            fanStatus 
              ? "bg-green-100 border-green-300 dark:bg-green-900/30" 
              : "bg-gray-100 border-gray-200 dark:bg-gray-800"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-medium">Exhaust Fan</span>
              </div>
              <button
                onClick={handleFanStatusChange}
                disabled={mode === "otomatis" || isLoading}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  fanStatus 
                    ? "bg-green-500 text-white" 
                    : "bg-gray-200 text-gray-700"
                } ${mode === "otomatis" ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {fanStatus ? "ON" : "OFF"}
              </button>
            </div>
            {mode === "otomatis" && (
              <p className="mt-2 text-xs text-gray-500">
                Controlled automatically based on conditions
              </p>
            )}
          </div>
          
          <div className={`p-4 rounded-lg border ${
            pumpStatus 
              ? "bg-green-100 border-green-300 dark:bg-green-900/30" 
              : "bg-gray-100 border-gray-200 dark:bg-gray-800"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-medium">Water Pump</span>
              </div>
              <button
                onClick={handlePumpStatusChange}
                disabled={mode === "otomatis" || isLoading}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  pumpStatus 
                    ? "bg-green-500 text-white" 
                    : "bg-gray-200 text-gray-700"
                } ${mode === "otomatis" ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {pumpStatus ? "ON" : "OFF"}
              </button>
            </div>
            {mode === "otomatis" && (
              <p className="mt-2 text-xs text-gray-500">
                Controlled automatically based on humidity
              </p>
            )}
          </div>
        </div>
        
        {/* Status Information */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
          <h4 className="font-medium text-blue-800 dark:text-blue-200">
            Current System Status
          </h4>
          <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
            {mode === "otomatis" 
              ? "System is in automatic smart mode. Devices will be intelligently controlled based on real-time sensor data."
              : "System is in full manual mode. You have complete direct control over all devices."}
          </p>
        </div>
      </div>
    </div>
  );
}