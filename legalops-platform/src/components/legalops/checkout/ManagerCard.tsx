import React from 'react';
import { Trash2, User } from 'lucide-react';
import { cn, cardBase } from '../theme';

export interface Manager {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

export interface ManagerCardProps {
  manager: Manager;
  onRemove?: (id: string) => void;
  showRemove?: boolean;
  className?: string;
}

export function ManagerCard({ manager, onRemove, showRemove = true, className }: ManagerCardProps) {
  return (
    <div className={cn(cardBase, 'p-6 hover:shadow-md transition-shadow', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-sky-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-slate-900 mb-1">{manager.name}</h4>
            <p className="text-sm text-slate-600">{manager.email}</p>
            {manager.phone && <p className="text-sm text-slate-600">{manager.phone}</p>}
          </div>
        </div>
        {showRemove && onRemove && (
          <button
            type="button"
            onClick={() => onRemove(manager.id)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            aria-label="Remove manager"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {manager.address && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-600">
            {manager.address.street}
            <br />
            {manager.address.city}, {manager.address.state} {manager.address.zip}
          </p>
        </div>
      )}
    </div>
  );
}

