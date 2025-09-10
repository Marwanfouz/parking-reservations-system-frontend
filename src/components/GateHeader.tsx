import { Car, Clock } from 'lucide-react';

interface GateHeaderProps {
  readonly gateId: string;
  readonly gateName: string;
  readonly connectionStatus: 'connected' | 'disconnected' | 'connecting';
  readonly currentTime: string;
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
    <header className="bg-white border-b">
      <div className="container mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-soft">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{gateName}</h1>
            <p className="text-sm text-gray-600">Gate {gateId}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-2 text-sm px-2.5 py-1.5 rounded-full bg-gray-100 text-gray-700`}>
              <span className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
              {getStatusText()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{currentTime}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
