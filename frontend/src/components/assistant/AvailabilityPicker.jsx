import React from 'react';
import { CalendarDays, Clock3 } from 'lucide-react';
import dayjs from '../../lib/dateFormat';
import { cn } from '../../lib/utils';

const AvailabilityPicker = ({ availability, selectedSlot, onSelectSlot }) => {
  return (
    <div className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm shadow-slate-900/[0.03]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground/70">Khoảng trống tuần này</p>
          <h3 className="mt-1 text-base font-semibold text-foreground">Availability snapshot</h3>
        </div>
        <div className="rounded-2xl border border-border/80 bg-accent/80 p-2 text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
        </div>
      </div>

      <div className="space-y-4">
        {availability.map((day) => (
          <div key={day.dateISO} className="space-y-3 rounded-[1.25rem] border border-border/70 bg-background/80 p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">{dayjs(day.dateISO).format('dddd, DD/MM')}</p>
              <p className="text-xs text-muted-foreground">Các khung giờ khả dụng để lên lịch nhanh</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {day.slots.map((slot) => {
                const isActive = selectedSlot?.id === slot.id;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => onSelectSlot(slot)}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-all',
                      isActive
                        ? 'border-border bg-accent text-foreground'
                        : 'border-border/80 bg-card text-muted-foreground hover:bg-accent/75 hover:text-foreground'
                    )}
                  >
                    <Clock3 className="h-3.5 w-3.5" />
                    {slot.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailabilityPicker;
