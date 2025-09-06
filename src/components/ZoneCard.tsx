interface ZoneCardProps {
  readonly zone: {
    readonly id: string;
    readonly name: string;
    readonly categoryId: string;
    readonly occupied: number;
    readonly free: number;
    readonly reserved: number;
    readonly availableForVisitors: number;
    readonly availableForSubscribers: number;
    readonly rateNormal: number;
    readonly rateSpecial: number;
    readonly open: boolean;
  };
  readonly onSelect: (zoneId: string) => void;
  readonly disabled?: boolean;
  readonly selected?: boolean;
}

export function ZoneCard({ zone, onSelect, disabled, selected }: ZoneCardProps) {
  return (
    <button 
      className={`border-2 rounded-lg p-4 cursor-pointer transition-all text-left w-full ${
        selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300'}`}
      onClick={() => !disabled && onSelect(zone.id)}
      disabled={disabled}
      aria-label={`Zone ${zone.name}, ${zone.availableForVisitors} available for visitors`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold">{zone.name}</h3>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
          {zone.categoryId}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{zone.free}</div>
          <div className="text-sm text-gray-800">Free</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{zone.occupied}</div>
          <div className="text-sm text-gray-800">Occupied</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-800">Available for Visitors:</span>
          <span className={`font-semibold ${zone.availableForVisitors > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {zone.availableForVisitors}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-800">Available for Subscribers:</span>
          <span className="font-semibold text-blue-600">{zone.availableForSubscribers}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-800">Reserved:</span>
          <span className="font-semibold text-orange-600">{zone.reserved}</span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t">
        <div className="flex justify-between text-sm">
          <span className="text-gray-800">Normal Rate:</span>
          <span className="font-semibold text-gray-900">${zone.rateNormal}/hr</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-800">Special Rate:</span>
          <span className="font-semibold text-gray-900">${zone.rateSpecial}/hr</span>
        </div>
      </div>
      
      {!zone.open && (
        <div className="mt-2 text-center text-red-600 font-semibold">
          Zone Closed
        </div>
      )}
    </button>
  );
}
