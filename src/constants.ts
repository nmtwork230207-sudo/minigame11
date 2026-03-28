import { Question, Team, Card, CardType, WheelItem, CardConfig } from './types';

export const DEFAULT_TEAMS: Team[] = [
  { id: '1', name: 'CEO', score: 0, color: 'bg-red-500' },
  { id: '2', name: 'Manager', score: 0, color: 'bg-blue-500' },
  { id: '3', name: 'HR', score: 0, color: 'bg-green-500' },
];

export const TEAM_COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
];

export const REWARDS: WheelItem[] = [
  { label: '+10 Điểm', value: 10, type: 'points' },
  { label: '+20 Điểm', value: 20, type: 'points' },
  { label: '+30 Điểm', value: 30, type: 'points' },
  { label: '+40 Điểm', value: 40, type: 'points' },
  { label: '+50 Điểm', value: 50, type: 'points' },
  { label: 'Trúng mánh! +100 Điểm', value: 100, type: 'points' },
];

export const PENALTIES: WheelItem[] = [
  { label: '-10 Điểm', value: -10, type: 'points' },
  { label: '-20 Điểm', value: -20, type: 'points' },
  { label: '-30 Điểm', value: -30, type: 'points' },
  { label: 'Trừ nửa số điểm', value: 0, type: 'action' }, // Special case, handled in GameScreen if needed, or just keep as action
  { label: 'Về 0 Điểm 💀', value: 0, type: 'action' },
  { label: 'Hát 1 bài 🎤', value: 0, type: 'action' },
];

export const DEFAULT_QUESTIONS: Question[] = [
  // Vòng 1
  { id: 'q1', text: 'Động lực là sự thôi thúc chủ quan dẫn đến hành động của con người nhằm đáp ứng những nhu cầu của họ.', answer: 'Đúng', options: ['Đúng', 'Sai'], round: 1, type: 'multiple_choice' },
  { id: 'q2', text: 'Theo Frederick Winslow Taylor, yếu tố nào sau đây là động lực chính để nhân viên làm việc?', answer: 'Lương cao', options: ['Quan hệ xã hội', 'Lương cao', 'Sự tôn trọng', 'Tự khẳng định bản thân'], round: 1, type: 'multiple_choice' },
  { id: 'q3', text: 'Lý thuyết tâm lý xã hội (Hawthorne) cho rằng lương là yếu tố duy nhất quyết định động lực làm việc của nhân viên.', answer: 'Sai', options: ['Đúng', 'Sai'], round: 1, type: 'multiple_choice' },
  { id: 'q4', text: 'Tháp nhu cầu Maslow gồm bao nhiêu bậc?', answer: '5 bậc', options: ['3 bậc', '4 bậc', '5 bậc', '6 bậc'], round: 1, type: 'multiple_choice' },
  { id: 'q5', text: 'Theo Maslow, nhu cầu bậc thấp nhất của con người là nhu cầu ______.', answer: 'Sinh lý', round: 1, type: 'open_ended' },
  { id: 'q6', text: 'Thuyết ERG của Clayton Alderfer gồm mấy loại nhu cầu?', answer: '3 loại', options: ['2 loại', '3 loại', '4 loại', '5 loại'], round: 1, type: 'multiple_choice' },
  { id: 'q7', text: 'Thuyết ERG của Alderfer cho rằng con người chỉ có thể theo đuổi một loại nhu cầu tại một thời điểm.', answer: 'Sai', options: ['Đúng', 'Sai'], round: 1, type: 'multiple_choice' },
  { id: 'q8', text: 'Theo David McClelland, ba nhu cầu cơ bản của con người là:', answer: 'Thành đạt, liên minh, quyền lực', options: ['Sinh lý, an toàn, xã hội', 'Thành đạt, liên minh, quyền lực', 'Tồn tại, quan hệ, phát triển', 'Lương, thưởng, môi trường'], round: 1, type: 'multiple_choice' },
  { id: 'q9', text: 'Thuyết hai yếu tố của Herzberg phân chia các yếu tố thành: yếu tố ______ và yếu tố ______.', answer: 'Duy trì và Động viên', round: 1, type: 'open_ended' },
  { id: 'q10', text: 'Theo thuyết 2 yếu tố Herzberg, lương bổng và điều kiện làm việc là yếu tố động viên quan trọng nhất.', answer: 'Sai', options: ['Đúng', 'Sai'], round: 1, type: 'multiple_choice' },

  // Vòng 2
  { id: 'q11', text: 'Thuyết mong đợi của Victor H. Vroom được xây dựng vào năm nào?', answer: '1964', options: ['1954', '1960', '1964', '1975'], round: 2, type: 'multiple_choice' },
  { id: 'q12', text: 'Theo thuyết công bằng Stacy Adams, nếu người lao động cảm thấy không có sự công bằng, năng suất lao động của họ sẽ giảm sút.', answer: 'Đúng', options: ['Đúng', 'Sai'], round: 2, type: 'multiple_choice' },
  { id: 'q13', text: 'Công thức "Động lực = Sức hấp dẫn × Niềm tin" thuộc về thuyết nào?', answer: 'Thuyết mong đợi Vroom', options: ['Thuyết Maslow', 'Thuyết Herzberg', 'Thuyết mong đợi Vroom', 'Thuyết công bằng Adams'], round: 2, type: 'multiple_choice' },
  { id: 'q14', text: 'Điểm khác biệt cơ bản giữa thuyết ERG và thuyết Maslow là:', answer: 'ERG cho phép con người đồng thời theo đuổi nhiều nhu cầu', options: ['ERG có 5 bậc thay vì 3', 'ERG cho phép con người đồng thời theo đuổi nhiều nhu cầu', 'ERG chỉ áp dụng cho nhà quản trị', 'ERG không đề cập đến nhu cầu sinh lý'], round: 2, type: 'multiple_choice' },
  { id: 'q15', text: 'Lý thuyết cổ điển về động lực làm việc gắn liền với tên tuổi của Frederick Winslow ______ (1856–1915).', answer: 'Taylor', round: 2, type: 'open_ended' },
  { id: 'q16', text: 'Thuyết tạo động lực của Porter và Lawler cho rằng phần thưởng hợp lý góp phần tạo ra sự thỏa mãn của nhân viên, từ đó tiếp tục thực hiện công việc tốt hơn.', answer: 'Đúng', options: ['Đúng', 'Sai'], round: 2, type: 'multiple_choice' },
  { id: 'q17', text: 'Theo thuyết tạo động lực của Porter và Lawler, yếu tố nào KHÔNG thuộc mô hình?', answer: 'Phong cách lãnh đạo độc đoán', options: ['Khả năng thực hiện nhiệm vụ', 'Nhận thức về nhiệm vụ', 'Phần thưởng', 'Phong cách lãnh đạo độc đoán'], round: 2, type: 'multiple_choice' },
  { id: 'q18', text: 'Thuyết nào sau đây nhấn mạnh sự so sánh giữa "đóng góp" và "lợi ích nhận về" của người lao động?', answer: 'Thuyết Adams', options: ['Thuyết Maslow', 'Thuyết Vroom', 'Thuyết Adams', 'Thuyết Taylor'], round: 2, type: 'multiple_choice' },
  { id: 'q19', text: 'Theo mục 6.4, có bao nhiêu yếu tố chính ảnh hưởng đến hiệu quả lãnh đạo?', answer: '4', options: ['2', '3', '4', '5'], round: 2, type: 'multiple_choice' },
  { id: 'q20', text: 'Mọi nhà lãnh đạo đều có thể đạt hiệu quả lãnh đạo cao nếu họ có ý chí quyết tâm, dù không có nhận định đúng về tình huống.', answer: 'Sai', options: ['Đúng', 'Sai'], round: 2, type: 'multiple_choice' },

  // Vòng 3
  { id: 'q21', text: 'Theo mục 6.4.1, yếu tố đầu tiên ảnh hưởng đến hiệu quả lãnh đạo là ______ đúng.', answer: 'Nhận định', round: 3, type: 'open_ended' },
  { id: 'q22', text: 'Theo mục 6.4.2, kinh nghiệm ảnh hưởng đến hiệu quả lãnh đạo theo hướng nào?', answer: 'Nhà lãnh đạo có kinh nghiệm biết chọn phương pháp phù hợp với tổ chức', options: ['Kinh nghiệm chỉ có giá trị với nhà lãnh đạo trẻ', 'Nhà lãnh đạo có kinh nghiệm biết chọn phương pháp phù hợp với tổ chức', 'Kinh nghiệm thay thế được hoàn toàn nhận định đúng', 'Kinh nghiệm không quan trọng bằng trình độ học vấn'], round: 3, type: 'multiple_choice' },
  { id: 'q23', text: 'Nhà lãnh đạo nên sử dụng cùng một phong cách lãnh đạo cho tất cả nhân viên, bất kể trình độ của họ.', answer: 'Sai', options: ['Đúng', 'Sai'], round: 3, type: 'multiple_choice' },
  { id: 'q24', text: 'Theo mục 6.4.3, trình độ cao của nhân viên ảnh hưởng đến lãnh đạo theo hướng nào?', answer: 'Nhà lãnh đạo có thể áp dụng phong cách dân chủ', options: ['Nhà lãnh đạo cần kiểm soát chặt hơn', 'Nhà lãnh đạo có thể áp dụng phong cách dân chủ', 'Nhà lãnh đạo không cần quan tâm đến nhân viên', 'Nhà lãnh đạo nên dùng phong cách độc đoán'], round: 3, type: 'multiple_choice' },
  { id: 'q25', text: 'Yếu tố thứ 4 ảnh hưởng đến hiệu quả lãnh đạo là quan hệ với ______.', answer: 'Đồng nghiệp', round: 3, type: 'open_ended' },
  { id: 'q26', text: 'Anh Nam là quản đốc mới, nhân viên đều có trình độ thấp và chưa quen việc. Theo lý thuyết 6.4.3, anh Nam nên áp dụng phong cách nào?', answer: 'Giám sát chặt, hướng dẫn cụ thể', options: ['Tự do, ít giám sát', 'Dân chủ, giao quyền nhiều', 'Giám sát chặt, hướng dẫn cụ thể', 'Không cần quản lý'], round: 3, type: 'multiple_choice' },
  { id: 'q27', text: 'Theo nội dung mục 6.3, thuyết Maslow và thuyết ERG đều phân chia nhu cầu con người thành 5 bậc.', answer: 'Sai', options: ['Đúng', 'Sai'], round: 3, type: 'multiple_choice' },
  { id: 'q28', text: 'Một nhân viên so sánh lương của mình với đồng nghiệp cùng vị trí và thấy mình bị trả thấp hơn, dẫn đến giảm nỗ lực. Điều này phản ánh thuyết nào?', answer: 'Thuyết công bằng Adams', options: ['Thuyết Maslow', 'Thuyết Herzberg', 'Thuyết công bằng Adams', 'Thuyết mong đợi Vroom'], round: 3, type: 'multiple_choice' },
  { id: 'q29', text: 'Thuyết tạo động lực của Porter và Lawler cho rằng mô hình gồm 4 khâu: Giá trị phần thưởng → ______ → Nỗ lực → Kết quả.', answer: 'Khả năng thực hiện nhiệm vụ', round: 3, type: 'open_ended' },
  { id: 'q30', text: 'Công ty MTV Làm nghiệp Bình Thuận liên tục giải thể để tránh lỗ, bỏ mặc nhân viên. Điều này vi phạm yếu tố lãnh đạo nào nhất trong mục 6.4?', answer: 'Thiếu nhận định đúng và quan hệ với đồng nghiệp', options: ['Thiếu kinh nghiệm của lãnh đạo', 'Thiếu nhận định đúng và quan hệ với đồng nghiệp', 'Trình độ nhân viên quá thấp', 'Không có yếu tố nào bị vi phạm'], round: 3, type: 'multiple_choice' },
];

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒'];

export const DEFAULT_CARD_CONFIG: CardConfig = {
  round1Points: 10,
  round2Points: 20,
  round3Points: 30,
  goldPoints: 60,
  bombPoints: -30,
  cardBackImage: '',
  pairs: EMOJIS.map((emoji, i) => ({ id: `p${i}`, content: emoji, isImage: false })),
};

export const generateCards = (round: 1 | 2 | 3, config: CardConfig = DEFAULT_CARD_CONFIG, pairCount: number = 8): Card[] => {
  let pairs: { id: string, content: string, type: CardType, isImage: boolean }[] = [];
  
  let normalPairCount = pairCount;
  
  // Let's add special cards based on round and pairCount
  if (round === 3 && pairCount >= 4) {
    normalPairCount = pairCount - 4;
    pairs.push({ id: 'r3_gold1', content: '👑', type: 'gold', isImage: false });
    pairs.push({ id: 'r3_gold2', content: '👑', type: 'gold', isImage: false });
    pairs.push({ id: 'r3_bomb', content: '💣', type: 'bomb', isImage: false });
    pairs.push({ id: 'r3_lucky', content: '🎡', type: 'lucky_wheel', isImage: false });
  } else if (round === 2 && pairCount >= 2) {
    normalPairCount = pairCount - 2;
    pairs.push({ id: 'r2_bomb', content: '💣', type: 'bomb', isImage: false });
    pairs.push({ id: 'r2_lucky', content: '🎡', type: 'lucky_wheel', isImage: false });
  }

  // Pick normal pairs from config
  const availablePairs = [...config.pairs];
  for (let i = 0; i < normalPairCount; i++) {
    if (availablePairs.length > 0) {
      const p = availablePairs.shift()!;
      pairs.push({ ...p, type: 'normal' });
    } else {
      // fallback if not enough pairs configured
      const emoji = EMOJIS[i % EMOJIS.length];
      pairs.push({ id: `fallback_${i}`, content: emoji, type: 'normal', isImage: false });
    }
  }

  let cards: Card[] = [];
  pairs.forEach(p => {
    cards.push({ id: `${p.id}_a`, pairId: p.id, content: p.content, type: p.type, isFlipped: false, isMatched: false, isImage: p.isImage });
    cards.push({ id: `${p.id}_b`, pairId: p.id, content: p.content, type: p.type, isFlipped: false, isMatched: false, isImage: p.isImage });
  });

  return cards.sort(() => Math.random() - 0.5);
};
