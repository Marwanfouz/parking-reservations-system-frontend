interface TicketModalProps {
  readonly ticket: {
    readonly id: string;
    readonly type: 'visitor' | 'subscriber';
    readonly zoneId: string;
    readonly gateId: string;
    readonly checkinAt: string;
  };
  readonly zone: {
    readonly id: string;
    readonly name: string;
    readonly categoryId: string;
  };
  readonly gate: {
    readonly id: string;
    readonly name: string;
  };
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function TicketModal({ ticket, zone, gate, isOpen, onClose }: TicketModalProps) {
  if (!isOpen) return null;
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 ticket-modal">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Parking Ticket</h2>
          <button 
            onClick={onClose}
            className="text-gray-800 hover:text-gray-900 text-xl"
            aria-label="Close ticket"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4 ticket-content">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{ticket.id}</div>
            <div className="text-sm text-gray-800">Ticket ID</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-800">Type</div>
              <div className="font-semibold text-gray-900 capitalize">{ticket.type}</div>
            </div>
            <div>
              <div className="text-sm text-gray-800">Zone</div>
              <div className="font-semibold text-gray-900">{zone.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-800">Gate</div>
              <div className="font-semibold text-gray-900">{gate.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-800">Check-in Time</div>
              <div className="font-semibold text-gray-900">{new Date(ticket.checkinAt).toLocaleString()}</div>
            </div>
          </div>
          
          <div className="text-center pt-4">
            <div className="inline-block p-4 bg-green-100 rounded-lg">
              <div className="text-green-600 text-lg font-semibold">✓ Gate Open</div>
              <div className="text-sm text-gray-800">You may proceed</div>
            </div>
          </div>
          
          <div className="flex gap-2 no-print">
            <button 
              onClick={handlePrint}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Print Ticket
            </button>
            <button 
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
