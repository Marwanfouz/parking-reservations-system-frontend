interface SubscriptionInputProps {
  readonly subscriptionId: string;
  readonly onSubscriptionIdChange: (id: string) => void;
  readonly onVerify: (id: string) => void;
  readonly isLoading?: boolean;
  readonly error?: string;
  readonly subscription?: {
    readonly id: string;
    readonly userName: string;
    readonly cars: Array<{
      readonly plate: string;
      readonly brand: string;
      readonly model: string;
      readonly color: string;
    }>;
  } | undefined;
}

export function SubscriptionInput({ 
  subscriptionId, 
  onSubscriptionIdChange, 
  onVerify, 
  isLoading, 
  error, 
  subscription 
}: SubscriptionInputProps) {
  
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="subscription-id" className="block text-sm font-medium text-gray-800">
          Subscription ID
        </label>
        <input
          id="subscription-id"
          type="text"
          value={subscriptionId}
          onChange={(e) => onSubscriptionIdChange(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter subscription ID"
        />
      </div>
      
      <button 
        onClick={() => onVerify(subscriptionId)}
        disabled={!subscriptionId || isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Verifying...' : 'Verify Subscription'}
      </button>
      
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      {subscription && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="text-sm text-green-800">
            <strong>Verified:</strong> {subscription.userName}
          </div>
          <div className="mt-2 text-sm text-gray-800">
            <strong>Registered Cars:</strong>
            <ul className="mt-1 space-y-1">
              {subscription.cars.map((car) => (
                <li key={car.plate} className="text-gray-700">
                  {car.plate} - {car.brand} {car.model} ({car.color})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
