import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CalendarDays, 
  Mail, 
  ArrowLeft, 
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { authApi } from '../api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import { toast } from 'sonner';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Xử lý sự kiện gửi yêu cầu quên mật khẩu lên backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.forgotPassword(email);
      toast.success(response.message || 'Đường dẫn khôi phục đã được gửi!');
      setIsSubmitted(true);
    } catch (err) {
      const message = err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.';
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

        {/* Khung chứa các ô nhập liệu dạng kính mờ (Glassmorphism card) */}
        <div className="bg-card border border-border/50 p-8 rounded-[32px] shadow-2xl shadow-black/5 space-y-6">
          {!isSubmitted ? (
            <>
              {/* Tiêu đề & Hướng dẫn */}
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold">Quên mật khẩu?</h2>
                <p className="text-sm text-muted-foreground">
                  Nhập địa chỉ email của bạn, chúng tôi sẽ gửi đường dẫn khôi phục mật khẩu.
                </p>
              </div>

              {/* Form Nhập Email */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Địa chỉ Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="email"
                      type="email" 
                      placeholder="name@example.com" 
                      className="pl-11 h-12 bg-muted/30 border-transparent focus:bg-background transition-all rounded-xl"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Thông báo lỗi nếu có */}
                {error && (
                  <p className="text-xs text-destructive font-semibold bg-destructive/10 p-3 rounded-xl">
                    ⚠️ {error}
                  </p>
                )}

                {/* Nút gửi yêu cầu */}
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
                    'Gửi yêu cầu khôi phục'
                  )}
                </Button>
              </form>
            </>
          ) : (
            /* Giao diện hiển thị khi đã gửi email thành công */
            <div className="text-center space-y-5 py-4 animate-in zoom-in duration-500">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/25">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Kiểm tra Hòm thư</h2>
                <p className="text-sm text-muted-foreground px-2">
                  Chúng tôi đã gửi đường dẫn đặt lại mật khẩu đến hòm thư <strong className="text-foreground">{email}</strong>. Vui lòng kiểm tra và nhấp vào liên kết để tiếp tục.
                </p>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={() => setIsSubmitted(false)}
                  variant="outline" 
                  className="h-10 rounded-xl px-6 text-sm font-semibold border-border/80 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  Gửi lại yêu cầu khác
                </Button>
              </div>
            </div>
          )}

          {/* Đường dẫn quay lại Đăng nhập */}
          <div className="text-center pt-2">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground font-bold hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Quay lại Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
