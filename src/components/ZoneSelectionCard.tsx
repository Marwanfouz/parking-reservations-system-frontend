'use client';

import React from 'react';

interface ZoneSelectionCardProps {
  zone: {
    id?: string;
    zoneId?: string;
    name: string;
    categoryId?: string;
    open: boolean;
    free: number;
    occupied: number;
    totalSlots: number;
    reserved: number;
    availableForVisitors: number;
    availableForSubscribers: number;
    subscriberCount: number;
  };
  selected?: boolean;
  onSelect?: (zoneId: string) => void;
  subscriptionCategory?: string;
}

const ZoneSelectionCard = React.memo(({ zone, selected, onSelect, subscriptionCategory }: ZoneSelectionCardProps) => {
  const zoneId = zone.id ?? zone.zoneId;
  
  const isCompatible = !subscriptionCategory || zone.categoryId === subscriptionCategory;
  
  const isAvailable = zone.open && isCompatible && (
    subscriptionCategory ? zone.availableForSubscribers > 0 : zone.availableForVisitors > 0
  );
  
  const handleClick = () => {
    if (isAvailable && onSelect && zoneId) {
      onSelect(zoneId);
    }
  };
  
  return (
    <div 
      className={`bg-white/80 backdrop-blur-sm border rounded-xl p-6 hover-transition cursor-pointer ${
        selected 
          ? 'border-indigo-500 bg-indigo-50 shadow-lg ring-2 ring-indigo-200' 
          : isAvailable 
            ? 'border-white/20 hover:shadow-lg hover:border-indigo-300' 
            : 'border-gray-200 bg-gray-50/50 cursor-not-allowed opacity-60'
      }`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className={`font-semibold text-lg ${selected ? 'text-indigo-900' : 'text-gray-900'}`}>
            {zone.name}
          </h4>
          <p className="text-sm text-gray-600">ID: {zoneId}</p>
          <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full mt-2 ${
            isCompatible 
              ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {zone.categoryId?.replace('cat_', '').toUpperCase() ?? 'N/A'}
            {!isCompatible && ' (Incompatible)'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
            zone.open 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {zone.open ? 'Open' : 'Closed'}
          </span>
          {selected && (
            <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
          <div className="text-xl font-bold text-green-600">{zone.free}</div>
          <div className="text-xs text-gray-600 font-medium">Free</div>
        </div>
        <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
          <div className="text-xl font-bold text-blue-600">{zone.occupied}</div>
          <div className="text-xs text-gray-600 font-medium">Occupied</div>
        </div>
      </div>
      
      <div className="space-y-2 text-sm bg-gray-50/50 rounded-lg p-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Total:</span>
          <span className="font-semibold">{zone.totalSlots}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Reserved:</span>
          <span className="font-semibold">{zone.reserved}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Available Visitors:</span>
          <span className={`font-semibold ${zone.availableForVisitors > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {zone.availableForVisitors}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Available Subscribers:</span>
          <span className={`font-semibold ${zone.availableForSubscribers > 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {zone.availableForSubscribers}
          </span>
        </div>
      </div>
      
      {!isAvailable && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-600 text-center">
            {!zone.open ? 'Zone is closed' : 
             !isCompatible ? 'Category mismatch' : 
             'No available slots'}
          </p>
        </div>
      )}
    </div>
  );
});

ZoneSelectionCard.displayName = 'ZoneSelectionCard';

export default ZoneSelectionCard;
