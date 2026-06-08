import React from 'react';
import { CalendarClock, Sparkles } from 'lucide-react';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import dayjs from '../../lib/dateFormat';

const ConfirmDialog = ({ open, onOpenChange, slot, title, summary, onConfirm }) => {
  if (!slot) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Xác nhận lịch do AI đề xuất"
      description="Kiểm tra lại khung giờ trước khi lưu vào kế hoạch cá nhân của bạn."
      className="max-w-xl"
    >
      <div className="space-y-5">
        <div className="rounded-[1.5rem] border border-border/80 bg-accent/55 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/80 bg-card">
              <CalendarClock className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground">{summary}</p>
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-border/80 bg-card px-4 py-3 text-sm text-foreground">
            <p className="font-medium">{dayjs(slot.startISO).format('dddd, DD/MM/YYYY')}</p>
            <p className="mt-1 text-muted-foreground">
              {dayjs(slot.startISO).format('HH:mm')} - {dayjs(slot.endISO).format('HH:mm')} · {slot.label}
            </p>
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-border/80 bg-background p-4 text-sm text-muted-foreground">
          <div className="mb-2 flex items-center gap-2 text-foreground">
            <Sparkles className="h-4 w-4" />
            Gợi ý từ AI
          </div>
          <p className="leading-6">
            Khung giờ này đang cân bằng tốt giữa thời lượng, nhịp làm việc và khoảng trống hiện có trong lịch của bạn.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full px-5">
            Đóng
          </Button>
          <Button onClick={onConfirm} className="rounded-full px-5 shadow-none">
            Xác nhận lịch
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default ConfirmDialog;
