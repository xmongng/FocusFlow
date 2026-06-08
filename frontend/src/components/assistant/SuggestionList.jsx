import React from 'react';
import { CheckCircle2, Clock3, Sparkles } from 'lucide-react';
import dayjs from '../../lib/dateFormat';
import Button from '../ui/Button';

const SuggestionList = ({ suggestions, onSelectSlot }) => {
  if (!suggestions.length) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-border/80 bg-card/70 p-6 text-center">
        <Sparkles className="mx-auto mb-3 h-5 w-5 text-muted-foreground/50" />
        <p className="text-sm font-medium text-foreground">Chưa có gợi ý nào.</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Hãy mô tả nhu cầu lập lịch để AI phân tích và đề xuất khung giờ phù hợp.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion, index) => (
        <div key={suggestion.id} className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm shadow-slate-900/[0.03]">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground/70">Phương án {index + 1}</p>
              <h3 className="mt-1 text-base font-semibold text-foreground">{suggestion.summary}</h3>
            </div>
            <div className="rounded-full border border-border/80 bg-accent/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              AI đề xuất
            </div>
          </div>

          <p className="text-sm leading-6 text-muted-foreground">{suggestion.rationale}</p>

          <div className="mt-4 space-y-3">
            {suggestion.slots.map((slot) => (
              <div
                key={slot.id}
                className="flex flex-col gap-3 rounded-[1.25rem] border border-border/80 bg-accent/55 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Clock3 className="h-4 w-4 text-muted-foreground" />
                    {dayjs(slot.startISO).format('dddd, DD/MM/YYYY')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dayjs(slot.startISO).format('HH:mm')} - {dayjs(slot.endISO).format('HH:mm')} · {slot.label}
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => onSelectSlot(slot, suggestion)}
                  className="rounded-full border-border bg-background/90 px-4 hover:bg-background"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Chọn khung giờ
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SuggestionList;
