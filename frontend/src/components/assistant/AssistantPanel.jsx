import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, SendHorizonal, Calendar as CalendarIcon, Loader2, Trash2 } from 'lucide-react';
import MessageList from './MessageList';
import { aiApi } from '../../api';
import Button from '../ui/Button';
import dayjs from '../../lib/dateFormat';
import { toast } from 'sonner';

const SUGGESTIONS = [
  "Lên kế hoạch tập thể dục và đọc sách hôm nay",
  "Sắp xếp 1 tiếng học tiếng Anh và dọn nhà vào buổi sáng",
  "Lịch hôm nay của tôi có gì trống không?",
  "Tôi có những công việc nào chưa hoàn thành?",
];

const AssistantPanel = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Xin chào! Tôi là FocusFlow Assistant. Tôi có thể giúp bạn xem lịch trình hiện tại, trả lời các thắc mắc về công việc, hoặc lên kế hoạch thời gian biểu qua trò chuyện. Bạn muốn làm gì hôm nay?',
      rawText: 'Xin chào! Tôi là FocusFlow Assistant. Tôi có thể giúp bạn xem lịch trình hiện tại, trả lời các thắc mắc về công việc, hoặc lên kế hoạch thời gian biểu qua trò chuyện. Bạn muốn làm gì hôm nay?',
      ts: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [targetDate, setTargetDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [isThinking, setIsThinking] = useState(false);
  const [committingMessageId, setCommittingMessageId] = useState(null);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    // Tự động cuộn xuống cuối khi có tin nhắn mới
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking]);

  // Helper để phân tách plan ra khỏi text câu trả lời của AI
  const parsePlanFromText = (rawReplyText) => {
    const planRegex = /<plan>([\s\S]*?)<\/plan>/;
    const match = rawReplyText.match(planRegex);
    
    if (match) {
      try {
        const jsonStr = match[1].trim();
        const plan = JSON.parse(jsonStr);
        
        // Tạo blocksState có thêm ID ngẫu nhiên và status mặc định là 'pending'
        const blocksState = (plan.proposed_blocks || []).map((block, idx) => ({
          ...block,
          id: block.id || `draft-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
          status: block.status || 'pending'
        }));

        return {
          text: rawReplyText.replace(planRegex, '').trim(),
          plan: {
            ...plan,
            proposed_blocks: blocksState
          },
          blocksState
        };
      } catch (err) {
        console.error('Lỗi parse JSON trong plan:', err);
      }
    }
    
    return {
      text: rawReplyText,
      plan: null,
      blocksState: null
    };
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText.trim();
    if (!text) return;

    setInputText('');

    // Tạo tin nhắn người dùng
    // Đính kèm thông tin ngày đích (targetDate) vào nội dung gửi lên AI nếu người dùng nhắc đến thời gian tương đối
    const contextDateText = `[Ngày tham chiếu: ${targetDate}] ${text}`;
    
    const newUserMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: text, // Hiển thị text sạch trên giao diện
      rawText: contextDateText, // Gửi text kèm ngữ cảnh ngày lên AI
      ts: Date.now()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsThinking(true);

    try {
      // Chuẩn bị lịch sử trò chuyện gửi lên backend
      const chatHistory = [...messages, newUserMessage].map(msg => ({
        role: msg.role,
        content: msg.rawText || msg.text
      }));

      const response = await aiApi.chat(chatHistory);
      const rawReply = response.reply || '';

      // Phân tách text câu trả lời và khối proposed blocks
      const { text: cleanReplyText, plan, blocksState } = parsePlanFromText(rawReply);

      const newAssistantMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        text: cleanReplyText,
        rawText: rawReply,
        plan,
        blocksState,
        ts: Date.now()
      };

      setMessages(prev => [...prev, newAssistantMessage]);
    } catch (err) {
      console.error('Lỗi khi gọi AI:', err);
      toast.error('Không thể kết nối với AI Assistant. Vui lòng thử lại.');
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Cập nhật block khi người dùng chỉnh sửa hoặc chấp nhận/bác bỏ trên UI
  const handleUpdateBlock = (messageId, blockId, updates) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id !== messageId) return msg;

      const updatedBlocks = msg.blocksState.map(b => 
        b.id === blockId ? { ...b, ...updates } : b
      );

      // Cập nhật lại rawText để đồng bộ lịch sử gửi lên AI
      const updatedPlan = {
        proposed_blocks: updatedBlocks.map(b => ({
          title: b.title,
          type: b.type,
          startTime: b.startTime,
          endTime: b.endTime,
          priority: b.priority,
          reason: b.reason,
          status: b.status
        })),
        targetDate: msg.plan.targetDate
      };

      const planXml = `<plan>\n${JSON.stringify(updatedPlan, null, 2)}\n</plan>`;
      const cleanText = msg.rawText.replace(/<plan>[\s\S]*?<\/plan>/, '').trim();
      const newRawText = `${cleanText}\n\n${planXml}`;

      return {
        ...msg,
        blocksState: updatedBlocks,
        rawText: newRawText
      };
    }));
  };

  // Lưu lịch trình đã đề xuất vào CSDL
  const handleCommitPlan = async (blocks, dateStr, messageId) => {
    setCommittingMessageId(messageId);
    try {
      const results = await aiApi.commitPlan(blocks, dateStr);
      toast.success(`Đã lưu thành công ${results.eventsCreated} sự kiện và ${results.tasksCreated} công việc vào lịch.`);
      
      // Đánh dấu các blocks đã lưu thành công trên UI
      setMessages(prev => prev.map(msg => {
        if (msg.id !== messageId) return msg;
        return {
          ...msg,
          // Bỏ hiển thị plan sau khi đã lưu xong
          plan: null,
          blocksState: null,
          text: msg.text + '\n\n*(Kế hoạch này đã được lưu vào lịch trình của bạn)*'
        };
      }));

      // Bắn sự kiện làm mới lịch
      window.dispatchEvent(new Event('refresh-calendar'));
    } catch (err) {
      console.error('Lỗi lưu lịch trình:', err);
      toast.error('Có lỗi xảy ra khi lưu lịch trình vào cơ sở dữ liệu.');
    } finally {
      setCommittingMessageId(null);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: 'Lịch sử trò chuyện đã được làm sạch. Bạn muốn trợ lý ảo FocusFlow giúp gì tiếp theo?',
        rawText: 'Lịch sử trò chuyện đã được làm sạch. Bạn muốn trợ lý ảo FocusFlow giúp gì tiếp theo?',
        ts: Date.now()
      }
    ]);
  };

  return (
    <div className="flex flex-col h-full w-full bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-accent text-foreground">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-sm">FocusFlow AI Assistant</h2>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Sẵn sàng trò chuyện & lên kế hoạch
            </p>
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-red-500 rounded-lg"
          onClick={handleClearHistory}
          title="Xóa lịch sử trò chuyện"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
        <MessageList 
          messages={messages} 
          isThinking={isThinking} 
          onUpdateBlock={handleUpdateBlock}
          onCommitPlan={handleCommitPlan}
          committingMessageId={committingMessageId}
        />
        <div ref={scrollRef} />

        {/* Suggestion list if only welcome message exists */}
        {messages.length === 1 && !isThinking && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 max-w-2xl mx-auto">
            {SUGGESTIONS.map((s, idx) => (
              <button 
                key={idx}
                onClick={() => handleSendMessage(s)}
                className="p-3 text-left text-xs bg-muted/40 hover:bg-accent border border-border/60 hover:border-primary/30 rounded-xl transition-all text-muted-foreground hover:text-foreground flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{s}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border/80 p-4 bg-background">
        <div className="w-full space-y-3">
          {/* Target Date reference */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
              <CalendarIcon className="w-3 h-3 text-muted-foreground" />
              Ngày tham chiếu:
            </span>
            <input 
              type="date"
              className="text-xs bg-muted/70 hover:bg-accent border border-border/60 rounded-lg px-2 py-1 outline-none text-foreground font-medium transition-colors"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
            <span className="text-[9px] text-muted-foreground italic">
              (AI sẽ dựa trên ngày này khi bạn nói "hôm nay", "ngày mai",...)
            </span>
          </div>

          {/* Composer */}
          <div className="relative flex items-end gap-2 bg-muted/40 border border-border/60 rounded-[1.5rem] p-2 pr-3 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn để hỏi đáp hoặc yêu cầu sắp xếp lịch..."
              className="flex-1 max-h-32 min-h-[44px] resize-none bg-transparent text-sm leading-6 text-foreground outline-none px-2 py-2 placeholder:text-muted-foreground/50"
              disabled={isThinking}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={isThinking || !inputText.trim()}
              className="rounded-xl h-10 w-10 shrink-0 p-0 flex items-center justify-center"
            >
              {isThinking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizonal className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex justify-between items-center text-[10px] text-muted-foreground px-2">
            <span>Shift + Enter để xuống dòng</span>
            <span>FocusFlow Assistant sử dụng dữ liệu lịch và công việc hiện tại của bạn</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantPanel;
