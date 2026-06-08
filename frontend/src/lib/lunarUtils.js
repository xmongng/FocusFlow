import { SolarDate } from 'lunar-date-vn';

// Các ngày lễ Dương lịch cố định (Format: 'DD/MM')
const SOLAR_HOLIDAYS = {
  '01/01': { name: 'Tết Dương lịch', isOff: true },
  '14/02': { name: 'Lễ Tình nhân (Valentine)', isOff: false },
  '08/03': { name: 'Quốc tế Phụ nữ 8/3', isOff: false },
  '30/04': { name: 'Giải phóng miền Nam', isOff: true },
  '01/05': { name: 'Quốc tế Lao động', isOff: true },
  '01/06': { name: 'Quốc tế Thiếu nhi', isOff: false },
  '02/09': { name: 'Quốc khánh', isOff: true },
  '20/10': { name: 'Phụ nữ Việt Nam 20/10', isOff: false },
  '20/11': { name: 'Nhà giáo Việt Nam 20/11', isOff: false },
  '24/12': { name: 'Đêm Giáng sinh', isOff: false },
  '25/12': { name: 'Giáng sinh', isOff: false }
};

// Các ngày lễ Âm lịch cố định (Format: 'DD/MM')
const LUNAR_HOLIDAYS = {
  '01/01': { name: 'Mùng 1 Tết Nguyên Đán', isOff: true },
  '02/01': { name: 'Mùng 2 Tết Nguyên Đán', isOff: true },
  '03/01': { name: 'Mùng 3 Tết Nguyên Đán', isOff: true },
  '15/01': { name: 'Tết Nguyên Tiêu', isOff: false },
  '10/03': { name: 'Giỗ Tổ Hùng Vương', isOff: true },
  '15/04': { name: 'Lễ Phật Đản', isOff: false },
  '05/05': { name: 'Tết Đoan Ngọ', isOff: false },
  '15/07': { name: 'Lễ Vu Lan', isOff: false },
  '15/08': { name: 'Tết Trung Thu', isOff: false },
  '23/12': { name: 'Ông Công Ông Táo', isOff: false }
};

/**
 * Chuyển đổi một đối tượng Dayjs/Date sang thông tin Lịch Âm & Ngày Lễ
 * @param {Date|dayjs} dateObj 
 * @returns {Object} { solarDate, lunarDate, holiday, isSpecialDay }
 */
export function getCalendarInfo(dateObj) {
  const date = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
  
  // Lấy ngày dương lịch dạng DD/MM
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const solarKey = `${day}/${month}`;
  
  // Tính âm lịch
  let lunar = null;
  try {
    const solar = new SolarDate(date);
    lunar = solar.toLunarDate();
  } catch (e) {
    console.error('Error calculating lunar date:', e);
  }

  // Xác định ngày lễ
  let holiday = null;
  
  // 1. Kiểm tra lễ Dương Lịch
  if (SOLAR_HOLIDAYS[solarKey]) {
    holiday = { ...SOLAR_HOLIDAYS[solarKey], type: 'solar' };
  }

  // 2. Kiểm tra lễ Âm Lịch (nếu tính được lịch âm thành công)
  if (lunar) {
    const lunarDayStr = String(lunar.day).padStart(2, '0');
    const lunarMonthStr = String(lunar.month).padStart(2, '0');
    const lunarKey = `${lunarDayStr}/${lunarMonthStr}`;

    // Lễ mùng 1/ rằm hoặc các lễ âm lịch chính thức (không tính tháng nhuận)
    if (!lunar.leap_month) {
      if (LUNAR_HOLIDAYS[lunarKey]) {
        // Ưu tiên lễ âm lịch hoặc kết hợp
        holiday = { ...LUNAR_HOLIDAYS[lunarKey], type: 'lunar' };
      } else if (lunar.month === 12 && lunar.day === lunar.length) {
        holiday = { name: 'Giao thừa', isOff: true, type: 'lunar' };
      }
    }
  }

  // Ngày đặc biệt trong văn hóa (Mùng 1 hoặc Rằm hàng tháng)
  const isSpecialLunarDay = lunar && !lunar.leap_month && (lunar.day === 1 || lunar.day === 15);

  return {
    solarDay: date.getDate(),
    lunar,
    holiday,
    isSpecialLunarDay
  };
}
