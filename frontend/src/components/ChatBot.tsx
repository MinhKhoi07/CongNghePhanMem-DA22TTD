import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, TextField, Paper, Typography, Button, Fade } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';

interface Message {
  from: 'user' | 'bot';
  text: string;
}

const rules: { keyword: string; answer: string }[] = [
  { keyword: 'calo', answer: 'Bạn muốn hỏi về calo món nào? Ví dụ: "Calo của cơm tấm là bao nhiêu?"' },
  { keyword: 'cơm tấm', answer: 'Cơm tấm trung bình chứa khoảng 600 kcal/phần.' },
  { keyword: 'trà sữa', answer: 'Trà sữa trung bình chứa khoảng 250-400 kcal/ly.' },
  { keyword: 'phở', answer: 'Phở bò trung bình chứa khoảng 350-400 kcal/tô.' },
  { keyword: 'bún bò', answer: 'Bún bò Huế trung bình chứa khoảng 500-600 kcal/tô.' },
  { keyword: 'cháo', answer: 'Cháo trắng trung bình chứa khoảng 150 kcal/bát.' },
  { keyword: 'bánh mì', answer: 'Bánh mì Việt Nam trung bình chứa khoảng 250-300 kcal/ổ.' },
  { keyword: 'sữa chua', answer: 'Sữa chua không đường khoảng 60-80 kcal/hộp.' },
  { keyword: 'trái cây', answer: 'Trái cây rất tốt cho sức khỏe, nên ăn đa dạng các loại mỗi ngày.' },
  { keyword: 'giảm cân', answer: 'Để giảm cân, bạn nên ăn nhiều rau xanh, hạn chế tinh bột xấu và tập thể dục đều đặn.' },
  { keyword: 'tăng cân', answer: 'Để tăng cân, hãy bổ sung thêm protein, tinh bột tốt và ăn đủ bữa mỗi ngày.' },
  { keyword: 'uống nước', answer: 'Bạn nên uống 1.5-2 lít nước mỗi ngày.' },
  { keyword: 'hoa quả', answer: 'Ăn nhiều hoa quả giúp bổ sung vitamin và khoáng chất cho cơ thể.' },
  { keyword: 'vitamin', answer: 'Vitamin rất cần thiết, bạn nên bổ sung qua rau củ, trái cây tươi.' },
  { keyword: 'khoáng chất', answer: 'Khoáng chất có nhiều trong rau xanh, hải sản, các loại hạt.' },
  { keyword: 'nước ép', answer: 'Nước ép trái cây tươi tốt hơn nước ngọt đóng chai.' },
  { keyword: 'hướng dẫn', answer: 'Bạn có thể nhập thông tin bữa ăn, xem lịch sử, và theo dõi tổng calo mỗi ngày.' },
  { keyword: 'dinh dưỡng', answer: 'Ăn nhiều rau xanh, uống đủ nước, hạn chế đồ ngọt và dầu mỡ nhé!' },
  { keyword: 'liên hệ', answer: 'Bạn có thể liên hệ admin qua email hoặc tạo issue trên GitHub.' },
  { keyword: 'sáng nên ăn gì', answer: 'Bữa sáng nên ăn các món như: bánh mì trứng, phở, bún, cháo, yến mạch, sữa chua và trái cây.' },
  { keyword: 'trưa nên ăn gì', answer: 'Bữa trưa nên ăn cơm với thịt nạc, cá, rau xanh, canh và một ít trái cây tráng miệng.' },
  { keyword: 'chiều nên ăn gì', answer: 'Bữa chiều có thể ăn nhẹ như sữa chua, trái cây, bánh mì sandwich hoặc salad.' },
  { keyword: 'tối nên ăn gì', answer: 'Bữa tối nên ăn nhẹ, ưu tiên rau củ, cá, thịt nạc, hạn chế tinh bột và đồ chiên xào.' },
  { keyword: 'bữa sáng', answer: 'Bữa sáng rất quan trọng, bạn nên ăn đủ chất như tinh bột, protein và vitamin.' },
  { keyword: 'bữa trưa', answer: 'Bữa trưa là bữa chính, nên ăn đa dạng các nhóm chất: tinh bột, đạm, rau củ.' },
  { keyword: 'bữa chiều', answer: 'Bữa chiều là bữa phụ, nên ăn nhẹ để không ảnh hưởng bữa tối.' },
  { keyword: 'bữa tối', answer: 'Bữa tối nên ăn nhẹ, tránh ăn quá no hoặc nhiều dầu mỡ.' },
  { keyword: 'tập thể dục', answer: 'Bạn nên tập thể dục ít nhất 30 phút mỗi ngày để duy trì sức khỏe.' },
  { keyword: 'ngủ', answer: 'Ngủ đủ 7-8 tiếng mỗi ngày giúp cơ thể phục hồi và khỏe mạnh.' },
  { keyword: 'stress', answer: 'Hãy thư giãn, tập thở sâu hoặc nghe nhạc để giảm stress.' },
  { keyword: 'ăn chay', answer: 'Ăn chay lành mạnh nếu bạn bổ sung đủ protein từ đậu, nấm, hạt.' },
  { keyword: 'dị ứng', answer: 'Nếu bạn dị ứng thực phẩm, hãy đọc kỹ thành phần trước khi ăn.' },
  { keyword: 'ăn kiêng', answer: 'Ăn kiêng nên cân bằng các nhóm chất, không nên nhịn ăn quá mức.' },
  { keyword: 'cố lên', answer: 'Bạn đang làm rất tốt! Hãy tiếp tục duy trì thói quen lành mạnh nhé!' },
  { keyword: 'mệt', answer: 'Bạn nên nghỉ ngơi, uống nước và ăn nhẹ để lấy lại năng lượng.' },
  { keyword: 'chào', answer: 'Xin chào! Mình là ChatBot dinh dưỡng, bạn cần hỏi gì nào?' },
];

const fallback = 'Xin lỗi, tôi chưa hiểu câu hỏi này. Bạn có thể hỏi về calo, dinh dưỡng, hoặc cách sử dụng app!';

const ChatBot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: 'Xin chào! Tôi là trợ lý dinh dưỡng. Bạn muốn hỏi gì?' }
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user' as const, text: input };
    setMessages(msgs => [...msgs, userMsg]);
    // Rule-based reply
    const lower = input.toLowerCase();
    const found = rules.find(r => lower.includes(r.keyword));
    setTimeout(() => {
      setMessages(msgs => [
        ...msgs,
        { from: 'bot', text: found ? found.answer : fallback }
      ]);
    }, 500);
    setInput('');
  };

  return (
    <>
      {!open && (
        <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1300 }}>
          <Fade in={!open}>
            <IconButton color="primary" size="large" onClick={() => setOpen(true)} sx={{ bgcolor: 'white', boxShadow: 3 }}>
              <ChatIcon fontSize="large" />
            </IconButton>
          </Fade>
        </Box>
      )}
      {open && (
        <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1300, width: 340 }}>
          <Fade in={open}>
            <Paper elevation={6} sx={{ p: 2, borderRadius: 3, height: 420, display: 'flex', flexDirection: 'column', boxShadow: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" fontWeight={700} color="primary" sx={{ flexGrow: 1 }}>
                  ChatBot Dinh Dưỡng
                </Typography>
                <IconButton onClick={() => setOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <Box sx={{ flex: 1, overflowY: 'auto', mb: 1, bgcolor: '#f9fbe7', p: 1, borderRadius: 2 }}>
                {messages.map((msg, idx) => (
                  <Box key={idx} sx={{ textAlign: msg.from === 'user' ? 'right' : 'left', mb: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        display: 'inline-block',
                        bgcolor: msg.from === 'user' ? '#c8e6c9' : '#fffde7',
                        color: 'text.primary',
                        px: 1.5, py: 0.5, borderRadius: 2, maxWidth: '80%',
                        fontWeight: msg.from === 'user' ? 600 : 400
                      }}
                    >
                      {msg.text}
                    </Typography>
                  </Box>
                ))}
                <div ref={bottomRef} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Nhập câu hỏi..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <Button variant="contained" color="primary" onClick={handleSend} disabled={!input.trim()}>
                  Gửi
                </Button>
              </Box>
            </Paper>
          </Fade>
        </Box>
      )}
    </>
  );
};

export default ChatBot; 