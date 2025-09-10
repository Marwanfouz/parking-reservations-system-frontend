'use client';

import React from 'react';

interface ZoneCardProps {
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
  onStatusUpdate: (zoneId: string, open: boolean) => void;
  isUpdating: boolean;
}

const ZoneCard = React.memo(({ zone, onStatusUpdate, isUpdating }: ZoneCardProps) => {
  const zoneId = zone.id ?? zone.zoneId;
  const buttonText = zone.open ? 'Close Zone' : 'Open Zone';
  
  let buttonClasses: string;
  if (zone.open) {
    buttonClasses = 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg';
  } else {
    buttonClasses = 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg';
  }
  
  const statusClasses = zone.open ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  const statusText = zone.open ? 'Open' : 'Closed';
  
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl p-4 sm:p-6 hover:shadow-lg hover-transition">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-base sm:text-lg truncate">{zone.name}</h4>
          <p className="text-xs sm:text-sm text-gray-600">ID: {zoneId}</p>
          <span className="inline-block px-2 sm:px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full mt-2">
            {zone.categoryId?.replace('cat_', '').toUpperCase() ?? 'N/A'}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full ${statusClasses}`}>
            {statusText}
          </span>
          <button 
            onClick={() => onStatusUpdate(zoneId!, !zone.open)}
            disabled={isUpdating}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-shadow duration-200 shadow-lg ${buttonClasses} disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto`}
          >
            {isUpdating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="hidden sm:inline">Updating...</span>
                <span className="sm:hidden">...</span>
              </span>
            ) : (
              <span className="truncate">{buttonText}</span>
            )}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4">
        <div className="text-center bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-2 sm:p-3 border border-green-200">
          <div className="text-lg sm:text-xl font-bold text-green-600">{zone.free}</div>
          <div className="text-xs text-gray-600 font-medium">Free</div>
        </div>
        <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 sm:p-3 border border-blue-200">
          <div className="text-lg sm:text-xl font-bold text-blue-600">{zone.occupied}</div>
          <div className="text-xs text-gray-600 font-medium">Occupied</div>
        </div>
      </div>
      
      <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm bg-gray-50/50 rounded-lg p-2 sm:p-3">
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
      </div>
  );
});

ZoneCard.displayName = 'ZoneCard';

export default ZoneCard;