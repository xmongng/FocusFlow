import React, { useState } from 'react';
import { SendHorizonal, Calendar as CalendarIcon } from 'lucide-react';
import Button from '../ui/Button';
import dayjs from '../../lib/dateFormat';

const SchedulingComposer = ({ onSend, disabled }) => {
  const [value, setValue] = useState('');
  const [targetDate, setTargetDate] = useState(dayjs().format('YYYY-MM-DD'));

  const submit = () => {
    const next = value.trim();
    if (!next || disabled) return;
    onSend(next, targetDate);
    setValue('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="rounded-[1.5rem] border border-border bg-background p-3 shadow-inner shadow-slate-200/30">
      <div className="flex items-center gap-2 pb-2">
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        <input 
          type="date"
          className="text-sm bg-transparent outline-none text-foreground"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          disabled={disabled}
        />
      </div>
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Nhập yêu cầu lên lịch (VD: Sắp lịch họp 1 tiếng buổi chiều)..."
        className="min-h-[88px] w-full resize-none bg-transparent text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground/55"
        disabled={disabled}
      />
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/80 pt-3">
        <p className="text-xs text-muted-foreground">Enter để gửi</p>
        <Button
          onClick={submit}
          disabled={disabled || !value.trim()}
          className="rounded-full px-5 shadow-none"
        >
          Tạo kế hoạch
          <SendHorizonal className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SchedulingComposer;
