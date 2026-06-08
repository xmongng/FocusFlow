import dayjs from '../lib/dateFormat';

const addSlot = (baseDate, dayOffset, hour, minute, durationMinutes, label) => {
  const start = dayjs(baseDate)
    .add(dayOffset, 'day')
    .hour(hour)
    .minute(minute)
    .second(0)
    .millisecond(0);

  const end = start.add(durationMinutes, 'minute');

  return {
    id: `${start.valueOf()}-${durationMinutes}`,
    startISO: start.toISOString(),
    endISO: end.toISOString(),
    label,
  };
};

const buildAvailability = () => {
  const now = dayjs().startOf('day');

  return [
    {
      dateISO: now.add(1, 'day').toISOString(),
      slots: [
        addSlot(now, 1, 9, 0, 30, '09:00 - 09:30'),
        addSlot(now, 1, 10, 30, 45, '10:30 - 11:15'),
        addSlot(now, 1, 14, 0, 30, '14:00 - 14:30'),
      ],
    },
    {
      dateISO: now.add(2, 'day').toISOString(),
      slots: [
        addSlot(now, 2, 8, 30, 30, '08:30 - 09:00'),
        addSlot(now, 2, 13, 30, 60, '13:30 - 14:30'),
      ],
    },
    {
      dateISO: now.add(3, 'day').toISOString(),
      slots: [
        addSlot(now, 3, 11, 0, 30, '11:00 - 11:30'),
        addSlot(now, 3, 15, 0, 45, '15:00 - 15:45'),
      ],
    },
  ];
};

export const analyzeSchedulingIntent = async (intent) => {
  const normalizedIntent = intent.trim();
  const lower = normalizedIntent.toLowerCase();
  const durationMinutes = lower.includes('45') ? 45 : lower.includes('60') || lower.includes('1 tiếng') ? 60 : 30;
  const title = normalizedIntent || 'Sắp lịch mới';
  const availability = buildAvailability();

  const suggestions = [
    {
      id: 'focus-1',
      summary: 'Ưu tiên lịch gần nhất vào buổi sáng',
      rationale: 'Khung giờ này còn trống và phù hợp để bắt đầu nhanh mà không làm vỡ nhịp làm việc hiện tại.',
      slots: availability[0].slots.slice(0, 2),
    },
    {
      id: 'focus-2',
      summary: 'Phương án cân bằng trong giờ làm việc',
      rationale: 'Các mốc giữa ngày giúp dễ phối hợp với đồng đội và vẫn còn thời gian xử lý việc phát sinh.',
      slots: [availability[1].slots[1], availability[2].slots[0]],
    },
    {
      id: 'focus-3',
      summary: 'Phương án linh hoạt nếu cần thêm thời lượng',
      rationale: 'Có khoảng trống dài hơn để xử lý các buổi họp cần trao đổi kỹ hoặc thêm ghi chú sau cuộc hẹn.',
      slots: [availability[2].slots[1]],
    },
  ];

  return {
    title,
    durationMinutes,
    availability,
    suggestions,
    assistantMessage: `Mình đã phân tích yêu cầu "${title}" và chọn ra ${suggestions.length} phương án phù hợp để bạn lên lịch nhanh hơn.`,
  };
};

export const buildConfirmationNote = (slot, title) => {
  const start = dayjs(slot.startISO).format('dddd, DD/MM/YYYY • HH:mm');
  const end = dayjs(slot.endISO).format('HH:mm');

  return `Đã sẵn sàng tạo lịch "${title}" vào ${start} đến ${end}.`;
};
