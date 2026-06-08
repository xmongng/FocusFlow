import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  CalendarDays, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { authApi } from '../api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import { toast } from 'sonner';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Xử lý gửi mật khẩu mới lên backend bằng mã token bảo mật
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Thiếu mã bảo mật để thực hiện đặt lại mật khẩu.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu mới phải dài tối thiểu 6 ký tự.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Xác nhận mật khẩu không khớp. Vui lòng nhập lại.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.resetPassword(token, formData.password);
      toast.success(response.message || 'Đặt lại mật khẩu thành công!');
      setIsSuccess(true);
      
      // Chuyển hướng về trang đăng nhập sau 3 giây
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      const message = err.response?.data?.message || 'Không thể khôi phục mật khẩu, mã xác thực có thể đã hết hạn hoặc không hợp lệ.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-in fade-in duration-700">
      <div className="w-full max-w-[440px] space-y-8">
        {/* Phần Logo ứng dụng */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-2xl shadow-primary/30 mb-2 rotate-3 hover:rotate-0 transition-transform duration-500">
            <CalendarDays className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Calendar<span className="text-primary">.</span>
          </h1>
          <p className="text-muted-foreground font-medium">Làm chủ thời gian, tối ưu hiệu suất</p>
        </div>

        {/* Khung Glassmorphism Card */}
        <div className="bg-card border border-border/50 p-8 rounded-[32px] shadow-2xl shadow-black/5 space-y-6">
          {!token ? (
            /* Trường hợp truy cập trực tiếp trang không có Token hợp lệ */
            <div className="text-center space-y-5 py-4 animate-in zoom-in duration-500">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/25">
                  <AlertTriangle className="h-10 w-10" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Mã Bảo Mật Không Hợp Lệ</h2>
                <p className="text-sm text-muted-foreground px-2">
                  Đường dẫn này thiếu mã xác thực hợp lệ hoặc đã bị chỉnh sửa. Vui lòng kiểm tra lại liên kết trong email hoặc gửi lại yêu cầu mới.
                </p>
              </div>

              <div className="pt-2">
                <Link to="/forgot-password">
                  <Button className="w-full h-11 rounded-xl text-sm font-bold shadow-lg shadow-primary/20">
                    Quay lại yêu cầu khôi phục
                  </Button>
                </Link>
              </div>
            </div>
          ) : !isSuccess ? (
            <>
              {/* Tiêu đề */}
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold">Đặt lại mật khẩu</h2>
                <p className="text-sm text-muted-foreground">
                  Nhập mật khẩu mới của bạn để hoàn tất quá trình khôi phục.
                </p>
              </div>

              {/* Form Khôi phục */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Ô Nhập Mật khẩu mới */}
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu mới (Tối thiểu 6 ký tự)</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      className="pl-11 pr-10 h-12 bg-muted/30 border-transparent focus:bg-background transition-all rounded-xl"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (error) setError(null);
                      }}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Ô Xác nhận mật khẩu mới */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      className="pl-11 pr-10 h-12 bg-muted/30 border-transparent focus:bg-background transition-all rounded-xl"
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
                        if (error) setError(null);
                      }}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Hiển thị lỗi nếu có */}
                {error && (
                  <p className="text-xs text-destructive font-semibold bg-destructive/10 p-3 rounded-xl">
                    ⚠️ {error}
                  </p>
                )}

                {/* Nút lưu */}
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Đang xử lý...
                    </div>
                  ) : (
                    'Cập nhật mật khẩu mới'
                  )}
                </Button>
              </form>
            </>
          ) : (
            /* Giao diện hiển thị khi Đổi mật khẩu Thành công */
            <div className="text-center space-y-5 py-4 animate-in zoom-in duration-500">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/25">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Đặt lại Thành Công!</h2>
                <p className="text-sm text-muted-foreground px-2">
                  Mật khẩu của bạn đã được cập nhật thành công. Đang tự động chuyển hướng về trang Đăng nhập sau vài giây...
                </p>
              </div>

              <div className="pt-2">
                <Link to="/login">
                  <Button className="w-full h-11 rounded-xl text-sm font-bold shadow-lg shadow-primary/20">
                    Đăng nhập ngay lập tức
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
