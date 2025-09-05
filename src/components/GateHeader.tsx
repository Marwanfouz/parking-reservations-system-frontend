interface GateHeaderProps {
  gateId: string;
  gateName: string;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  currentTime: string;
}

export function GateHeader({ gateId, gateName, connectionStatus, currentTime }: GateHeaderProps) {
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Disconnected';
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{gateName}</h1>
          <p className="text-lg opacity-90">Gate {gateId}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`} />
            <span className="text-sm">{getStatusText()}</span>
          </div>
          <div className="text-sm">
            {currentTime}
          </div>
        </div>
      </div>
    </header>
  );
}
