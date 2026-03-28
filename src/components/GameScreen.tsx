import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, ArrowRight, Timer, AlertTriangle, Bomb, Crown, CheckCircle2, XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Team, Question, Card, Round, PlayPhase, WheelItem, CardConfig } from '../types';
import { generateCards } from '../constants';
import { cn } from '../utils';
import { SlotMachine } from './SlotMachine';

interface GameScreenProps {
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  questions: Question[];
  rewards: WheelItem[];
  penalties: WheelItem[];
  cardConfig: CardConfig;
  onFinish: () => void;
  onBackToMenu: () => void;
}

export function GameScreen({ teams, setTeams, questions, rewards, penalties, cardConfig, onFinish, onBackToMenu }: GameScreenProps) {
  const [currentRound, setCurrentRound] = useState<Round>(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<PlayPhase>('waiting_next_question');
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [flipsThisTurn, setFlipsThisTurn] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const roundQuestions = questions.filter(q => q.round === currentRound);
  const currentQuestion = roundQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex >= roundQuestions.length - 1;

  // Initialize round
  useEffect(() => {
    const pairCount = roundQuestions.length;
    setCards(generateCards(currentRound, cardConfig, pairCount));
    setTimeLeft(currentRound === 3 ? 20 : 15);
  }, [currentRound, cardConfig, roundQuestions.length]);

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      if (phase === 'answering' && activeTeamId) {
        if (currentQuestion?.type === 'open_ended') {
          showMessage('Hết giờ! MC xác nhận đáp án.', 'warning');
        } else {
          showMessage('Hết giờ! Chuẩn bị nhận phạt...', 'error');
          setTimeout(() => {
            setPhase('wheel_penalty');
          }, 1500);
        }
      } else {
        showMessage('Hết giờ!', 'warning');
        setPhase('question');
        setActiveTeamId(null);
        setTimeLeft(currentRound === 3 ? 20 : 15);
      }
    }
  }, [timeLeft, isTimerRunning, phase, activeTeamId, currentRound, currentQuestion]);

  const showMessage = (text: string, type: 'success' | 'error' | 'info' | 'warning', duration = 3000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), duration);
  };

  const startTeamSelection = () => setPhase('team_selection');
  
  const handleTeamSelected = (teamId: string) => {
    setActiveTeamId(teamId);
    setPhase('answering');
    setIsTimerRunning(true);
  };

  const handleRevealAnswer = () => {
    setIsTimerRunning(false);
  };

  const handleAnswer = (selectedOption: string) => {
    setIsTimerRunning(false);
    if (!activeTeamId || !currentQuestion) return;

    if (selectedOption === currentQuestion.answer) {
      setTeams(teams.map(t => t.id === activeTeamId ? { ...t, score: t.score + 5 } : t));
      showMessage(`Chính xác! (+5đ). Mời chọn 2 thẻ.`, 'success');
      setPhase('flipping');
      setFlipsThisTurn(0);
    } else {
      showMessage(`Sai rồi! Chuẩn bị nhận phạt...`, 'error');
      setTimeout(() => {
        setPhase('wheel_penalty');
      }, 1500);
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion || !currentQuestion) {
      if (currentRound < 3) {
        setCurrentRound((prev) => (prev + 1) as Round);
        setCurrentQuestionIndex(0);
        setPhase('waiting_next_question');
        setActiveTeamId(null);
        setFlipsThisTurn(0);
      } else {
        onFinish();
      }
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setPhase('waiting_next_question');
      setActiveTeamId(null);
      setFlipsThisTurn(0);
      setTimeLeft(currentRound === 3 ? 20 : 15);
      setIsTimerRunning(false);
    }
  };

  const handleCardClick = (cardId: string) => {
    if (phase !== 'flipping' || !activeTeamId) return;
    if (flipsThisTurn >= 2) return;
    
    const clickedCard = cards.find(c => c.id === cardId);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    const newCards = cards.map(c => c.id === cardId ? { ...c, isFlipped: true } : c);
    setCards(newCards);
    setFlipsThisTurn(prev => prev + 1);

    // Check for matches among all flipped, unmatched cards
    const flippedUnmatched = newCards.filter(c => c.isFlipped && !c.isMatched);
    
    const pairCounts: Record<string, number> = {};
    let matchedPairId: string | null = null;
    for (const c of flippedUnmatched) {
      pairCounts[c.pairId] = (pairCounts[c.pairId] || 0) + 1;
      if (pairCounts[c.pairId] === 2) {
        matchedPairId = c.pairId;
        break;
      }
    }

    if (matchedPairId) {
      const matchedCards = newCards.filter(c => c.pairId === matchedPairId);
      const cardType = matchedCards[0].type;
      
      let pointsWon = 0;
      const normalPoints = currentRound === 1 ? cardConfig.round1Points : currentRound === 2 ? cardConfig.round2Points : cardConfig.round3Points;
      
      if (cardType === 'gold') pointsWon = normalPoints * 2;
      else if (cardType === 'bomb') pointsWon = -normalPoints;
      else if (cardType === 'lucky_wheel') pointsWon = 0;
      else pointsWon = normalPoints;

      setTeams(prevTeams => prevTeams.map(t => t.id === activeTeamId ? { ...t, score: t.score + pointsWon } : t));
      setCards(prevCards => prevCards.map(c => c.pairId === matchedPairId ? { ...c, isMatched: true } : c));
      
      if (cardType === 'bomb') {
        showMessage(`Trúng BOM! Bị trừ ${Math.abs(pointsWon)} điểm!`, 'error');
        setTimeout(() => handleNextQuestion(), 2500);
      } else if (cardType === 'gold') {
        showMessage(`Tuyệt vời! Cặp VÀNG (+${pointsWon}đ)!`, 'success');
        setTimeout(() => handleNextQuestion(), 2500);
      } else if (cardType === 'lucky_wheel') {
        showMessage(`May mắn! Bạn được quay Vòng Quay May Mắn!`, 'success');
        setTimeout(() => setPhase('wheel_reward'), 1500);
      } else {
        showMessage(`Ghép đúng! Cộng ${pointsWon} điểm!`, 'success');
        setTimeout(() => handleNextQuestion(), 1500);
      }
    } else if (flippedUnmatched.length === 2) {
      // Auto flip back after 1.5s if not matched
      setTimeout(() => {
        setCards(prevCards => prevCards.map(c => 
          (c.isFlipped && !c.isMatched) ? { ...c, isFlipped: false } : c
        ));
        handleNextQuestion();
      }, 1500);
    }
  };

  const [selectedWheelItem, setSelectedWheelItem] = useState<WheelItem | null>(null);

  const handleWheelFinish = (item: WheelItem) => {
    if (!activeTeamId) return;

    if (item.label !== 'Bỏ qua') {
      if (phase === 'wheel_penalty') {
        if (item.type === 'points') {
          setTeams(prev => prev.map(t => t.id === activeTeamId ? { ...t, score: t.score + item.value } : t));
          showMessage(`Phạt: ${item.label}`, 'error');
        } else {
          showMessage(`Hình phạt: ${item.label}`, 'warning', 5000);
        }
      } else if (phase === 'wheel_reward') {
        if (item.type === 'points') {
          setTeams(prev => prev.map(t => t.id === activeTeamId ? { ...t, score: t.score + item.value } : t));
          showMessage(`Thưởng thêm: ${item.label}`, 'success');
        } else {
          showMessage(`Phần thưởng: ${item.label}`, 'success', 5000);
        }
      }
    }

    if (item.audioUrl || item.hint || item.type === 'action') {
      setSelectedWheelItem(item);
    } else {
      handleNextQuestion();
    }
  };

  const closeWheelItemDetail = () => {
    setSelectedWheelItem(null);
    handleNextQuestion();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="p-4 md:p-6 flex justify-between items-center bg-slate-800/80 backdrop-blur-md border-b border-slate-700 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBackToMenu}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors"
            title="Trở về Menu"
          >
            <ArrowRight className="rotate-180" size={20} />
          </button>
          <div className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            VÒNG {currentRound}: {currentRound === 1 ? 'KHỞI ĐỘNG' : currentRound === 2 ? 'TĂNG TỐC' : 'SINH TỬ'}
          </div>
          <div className="hidden md:flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-full border border-slate-700 text-sm font-bold text-slate-400">
            Câu {currentQuestionIndex + 1} / {questions.length}
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {(phase === 'question' || phase === 'answering') && (
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xl transition-colors",
              timeLeft <= 5 ? "bg-red-500/20 text-red-500 animate-pulse" : "bg-slate-900 text-yellow-500 border border-slate-700"
            )}>
              <Timer size={24} />
              {timeLeft}s
            </div>
          )}
          {activeTeamId && (
            <div className="flex items-center gap-2 bg-indigo-500/20 px-4 py-2 rounded-full border border-indigo-500/50">
              <span className="text-indigo-300 font-bold">Đội:</span>
              <span className="text-white font-black">{teams.find(t => t.id === activeTeamId)?.name}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative">
        {/* Toast Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={cn(
                "absolute top-8 z-50 px-8 py-4 rounded-2xl font-bold text-xl shadow-2xl flex items-center gap-3",
                message.type === 'success' ? 'bg-emerald-500 text-white' :
                message.type === 'error' ? 'bg-red-500 text-white' :
                message.type === 'warning' ? 'bg-orange-500 text-white' :
                'bg-blue-500 text-white'
              )}
            >
              {message.type === 'success' && <CheckCircle2 size={28} />}
              {message.type === 'error' && <XCircle size={28} />}
              {message.type === 'warning' && <AlertTriangle size={28} />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!currentQuestion ? (
            <motion.div
              key="no-questions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-4xl bg-slate-800 p-10 rounded-3xl border border-slate-700 shadow-2xl text-center"
            >
              <h2 className="text-3xl font-bold text-slate-300 mb-6">Vòng này chưa có câu hỏi nào!</h2>
              <button
                onClick={handleNextQuestion}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xl rounded-2xl transition-colors"
              >
                Chuyển vòng tiếp theo
              </button>
            </motion.div>
          ) : phase === 'waiting_next_question' ? (
            <motion.div
              key="waiting-next"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="w-full max-w-2xl text-center space-y-8 bg-slate-800 p-12 rounded-3xl border border-slate-700 shadow-2xl"
            >
              <h2 className="text-4xl font-extrabold text-white">
                Sẵn sàng cho câu hỏi tiếp theo?
              </h2>
              <button
                onClick={() => setPhase('question')}
                className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-2xl rounded-2xl shadow-lg transition-transform hover:scale-105"
              >
                Hiện câu hỏi
              </button>
            </motion.div>
          ) : phase === 'question' || phase === 'team_selection' ? (
            <motion.div
              key="question-phase"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="w-full max-w-5xl text-center space-y-12"
            >
              {currentQuestion.imageUrl && (
                <div className="flex justify-center mb-6">
                  <img src={currentQuestion.imageUrl} alt="Question" className="max-h-64 object-contain rounded-2xl shadow-lg border-2 border-slate-700" />
                </div>
              )}
              {currentQuestion.audioUrl && (
                <div className="flex justify-center mb-6">
                  <audio controls className="w-full max-w-md" src={currentQuestion.audioUrl}>
                    Trình duyệt của bạn không hỗ trợ thẻ audio.
                  </audio>
                </div>
              )}
              <h2 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-white drop-shadow-2xl">
                {currentQuestion.text}
              </h2>
              {currentQuestion.hint && (
                <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700 max-w-3xl mx-auto">
                  <p className="text-lg text-slate-300 italic whitespace-pre-wrap">{currentQuestion.hint}</p>
                </div>
              )}
              
              <div className="flex justify-center gap-4 mt-8">
                {phase === 'question' ? (
                  <div className="flex flex-col items-center gap-4">
                    <button onClick={startTeamSelection} className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black text-2xl rounded-2xl shadow-lg transition-transform hover:scale-105">
                      BẮT ĐẦU TÍNH GIỜ
                    </button>
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors"
                    >
                      Bỏ qua câu này (Sang câu tiếp theo)
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 w-full max-w-3xl">
                    <h3 className="text-xl font-bold text-slate-400 mb-6 uppercase tracking-widest">Đội nào giành quyền trả lời?</h3>
                    <div className="flex flex-wrap justify-center gap-4">
                      {teams.map(team => (
                        <button
                          key={team.id}
                          onClick={() => handleTeamSelected(team.id)}
                          className={cn(
                            "px-6 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 border-2 border-transparent",
                            team.color, "hover:brightness-110 text-white shadow-lg"
                          )}
                        >
                          {team.name}
                        </button>
                      ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-700">
                      <button
                        onClick={handleNextQuestion}
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors"
                      >
                        Bỏ qua câu này
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : phase === 'answering' ? (
             <motion.div
              key="answering-phase"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-5xl text-center space-y-8"
            >
              <div className="flex justify-center mb-4">
                <button
                  onClick={() => {
                    setPhase('question');
                    setActiveTeamId(null);
                    setIsTimerRunning(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-bold"
                >
                  <ArrowLeft size={20} />
                  Chọn lại đội
                </button>
              </div>
              
              {currentQuestion.imageUrl && (
                <div className="flex justify-center mb-6">
                  <img src={currentQuestion.imageUrl} alt="Question" className="max-h-64 object-contain rounded-2xl shadow-lg border-2 border-slate-700" />
                </div>
              )}
              {currentQuestion.audioUrl && (
                <div className="flex justify-center mb-6">
                  <audio controls className="w-full max-w-md" src={currentQuestion.audioUrl}>
                    Trình duyệt của bạn không hỗ trợ thẻ audio.
                  </audio>
                </div>
              )}
              
              <h2 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight text-white drop-shadow-2xl mb-8">
                {currentQuestion.text}
              </h2>
              {currentQuestion.hint && (
                <div className="mb-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700 max-w-3xl mx-auto">
                  <p className="text-lg text-slate-300 italic whitespace-pre-wrap">{currentQuestion.hint}</p>
                </div>
              )}
              
              {currentQuestion.options && currentQuestion.options.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                  {currentQuestion.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(opt)}
                      disabled={!isTimerRunning}
                      className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-left text-lg font-medium transition-colors flex items-start gap-3 group disabled:opacity-50"
                    >
                      <span className="bg-slate-900 text-slate-400 w-8 h-8 rounded flex items-center justify-center shrink-0 font-bold group-hover:text-yellow-500 group-hover:bg-slate-800">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="mt-1">{opt}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-2xl mx-auto">
                   <p className="text-xl text-slate-400 mb-6">Câu hỏi này chưa có trắc nghiệm. MC xác nhận đáp án:</p>
                   {isTimerRunning ? (
                     <div className="flex justify-center mb-8">
                       <button onClick={handleRevealAnswer} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl">Xem đáp án</button>
                     </div>
                   ) : (
                     <p className="text-2xl font-bold text-white mb-8">Đáp án: <span className="text-emerald-400">{currentQuestion.answer}</span></p>
                   )}
                   <div className="flex justify-center gap-4">
                     <button onClick={() => handleAnswer(currentQuestion.answer)} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl">Đúng</button>
                     <button onClick={() => handleAnswer('wrong')} className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl">Sai</button>
                   </div>
                </div>
              )}
            </motion.div>
          ) : phase === 'wheel_penalty' ? (
             <motion.div key="wheel-penalty" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl">
                {selectedWheelItem ? (
                  <div className="bg-slate-800 p-8 rounded-3xl border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] text-center space-y-6">
                    <h3 className="text-3xl font-black text-red-500 mb-2">HÌNH PHẠT</h3>
                    <div className="text-4xl font-bold text-white">{selectedWheelItem.label}</div>
                    
                    {selectedWheelItem.audioUrl && (
                      <div className="flex justify-center my-6">
                        <audio controls className="w-full max-w-md" src={selectedWheelItem.audioUrl}>
                          Trình duyệt của bạn không hỗ trợ thẻ audio.
                        </audio>
                      </div>
                    )}
                    
                    {selectedWheelItem.hint && (
                      <div className="p-6 bg-slate-900/80 rounded-xl border border-slate-700 max-w-lg mx-auto">
                        <p className="text-xl text-slate-300 italic whitespace-pre-wrap">{selectedWheelItem.hint}</p>
                      </div>
                    )}
                    
                    {selectedWheelItem.type === 'action' ? (
                      <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <button 
                          onClick={() => {
                            if (selectedWheelItem.value !== 0) {
                              setTeams(prev => prev.map(t => t.id === activeTeamId ? { ...t, score: t.score + Math.abs(selectedWheelItem.value) } : t));
                              showMessage(`Đã cộng ${Math.abs(selectedWheelItem.value)} điểm`, 'success');
                            }
                            closeWheelItemDetail();
                          }}
                          className="flex-1 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xl transition-colors"
                        >
                          Thành công {selectedWheelItem.value !== 0 ? `(+${Math.abs(selectedWheelItem.value)}đ)` : ''}
                        </button>
                        <button 
                          onClick={() => {
                            if (selectedWheelItem.value !== 0) {
                              setTeams(prev => prev.map(t => t.id === activeTeamId ? { ...t, score: t.score - Math.abs(selectedWheelItem.value) } : t));
                              showMessage(`Đã trừ ${Math.abs(selectedWheelItem.value)} điểm`, 'error');
                            }
                            closeWheelItemDetail();
                          }}
                          className="flex-1 px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xl transition-colors"
                        >
                          Thất bại {selectedWheelItem.value !== 0 ? `(-${Math.abs(selectedWheelItem.value)}đ)` : ''}
                        </button>
                        <button onClick={closeWheelItemDetail} className="px-8 py-4 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-xl text-xl transition-colors">
                          Bỏ qua
                        </button>
                      </div>
                    ) : (
                      <button onClick={closeWheelItemDetail} className="mt-8 px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xl w-full transition-colors">
                        Hoàn thành hình phạt
                      </button>
                    )}
                  </div>
                ) : (
                  <SlotMachine items={penalties} title="VÒNG QUAY HÌNH PHẠT" type="penalty" onFinish={handleWheelFinish} />
                )}
             </motion.div>
          ) : phase === 'wheel_reward' ? (
             <motion.div key="wheel-reward" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl">
                {selectedWheelItem ? (
                  <div className="bg-slate-800 p-8 rounded-3xl border-2 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)] text-center space-y-6">
                    <h3 className="text-3xl font-black text-yellow-500 mb-2">PHẦN THƯỞNG</h3>
                    <div className="text-4xl font-bold text-white">{selectedWheelItem.label}</div>
                    
                    {selectedWheelItem.audioUrl && (
                      <div className="flex justify-center my-6">
                        <audio controls className="w-full max-w-md" src={selectedWheelItem.audioUrl}>
                          Trình duyệt của bạn không hỗ trợ thẻ audio.
                        </audio>
                      </div>
                    )}
                    
                    {selectedWheelItem.hint && (
                      <div className="p-6 bg-slate-900/80 rounded-xl border border-slate-700 max-w-lg mx-auto">
                        <p className="text-xl text-slate-300 italic whitespace-pre-wrap">{selectedWheelItem.hint}</p>
                      </div>
                    )}
                    
                    {selectedWheelItem.type === 'action' ? (
                      <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <button 
                          onClick={() => {
                            if (selectedWheelItem.value !== 0) {
                              setTeams(prev => prev.map(t => t.id === activeTeamId ? { ...t, score: t.score + Math.abs(selectedWheelItem.value) } : t));
                              showMessage(`Đã cộng ${Math.abs(selectedWheelItem.value)} điểm`, 'success');
                            }
                            closeWheelItemDetail();
                          }}
                          className="flex-1 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xl transition-colors"
                        >
                          Thành công {selectedWheelItem.value !== 0 ? `(+${Math.abs(selectedWheelItem.value)}đ)` : ''}
                        </button>
                        <button 
                          onClick={() => {
                            if (selectedWheelItem.value !== 0) {
                              setTeams(prev => prev.map(t => t.id === activeTeamId ? { ...t, score: t.score - Math.abs(selectedWheelItem.value) } : t));
                              showMessage(`Đã trừ ${Math.abs(selectedWheelItem.value)} điểm`, 'error');
                            }
                            closeWheelItemDetail();
                          }}
                          className="flex-1 px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xl transition-colors"
                        >
                          Thất bại {selectedWheelItem.value !== 0 ? `(-${Math.abs(selectedWheelItem.value)}đ)` : ''}
                        </button>
                        <button onClick={closeWheelItemDetail} className="px-8 py-4 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-xl text-xl transition-colors">
                          Bỏ qua
                        </button>
                      </div>
                    ) : (
                      <button onClick={closeWheelItemDetail} className="mt-8 px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-xl text-xl w-full transition-colors">
                        Nhận phần thưởng
                      </button>
                    )}
                  </div>
                ) : (
                  <SlotMachine items={rewards} title="VÒNG QUAY MAY MẮN" type="reward" onFinish={handleWheelFinish} />
                )}
             </motion.div>
          ) : (
            <motion.div
              key="flipping-phase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-6xl flex flex-col items-center"
            >
              <div className="text-center mb-6 flex flex-col items-center gap-4">
                <h3 className="text-2xl font-bold text-slate-300">
                  Lượt lật thẻ: {2 - flipsThisTurn} lần lật còn lại
                </h3>
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2"
                  >
                    Câu hỏi tiếp theo <ArrowRight size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setCards(cards.map(c => !c.isMatched ? { ...c, isFlipped: false } : c));
                      setFlipsThisTurn(0);
                    }}
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl shadow-lg flex items-center gap-2"
                  >
                    <RefreshCw size={20} /> Úp thẻ chưa khớp
                  </button>
                </div>
              </div>
              
              <div className={cn(
                "grid gap-2 md:gap-3 mx-auto w-full px-4 max-w-[95vw]",
                cards.length >= 30 ? "grid-cols-6 md:grid-cols-10" :
                cards.length >= 24 ? "grid-cols-5 md:grid-cols-8" :
                cards.length >= 20 ? "grid-cols-4 md:grid-cols-7" :
                cards.length >= 16 ? "grid-cols-4 md:grid-cols-6" :
                "grid-cols-3 md:grid-cols-5"
              )}>
                {cards.map((card, index) => (
                  <motion.button
                    key={card.id}
                    whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.05 } : {}}
                    whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.95 } : {}}
                    onClick={() => handleCardClick(card.id)}
                    className={cn(
                      "aspect-square rounded-lg text-2xl md:text-4xl flex items-center justify-center transition-all duration-300 preserve-3d relative cursor-pointer",
                      card.isFlipped || card.isMatched ? "rotate-y-180" : "bg-slate-800 border-2 border-slate-700 hover:border-indigo-500 shadow-lg"
                    )}
                    disabled={card.isFlipped || card.isMatched || flipsThisTurn >= 2}
                  >
                    {/* Front of card (hidden initially) */}
                    <div className={cn(
                      "absolute inset-0 rotate-y-180 rounded-lg flex items-center justify-center border-2 overflow-hidden transition-opacity duration-300",
                      card.isFlipped || card.isMatched ? "opacity-100" : "opacity-0",
                      card.isMatched 
                        ? card.type === 'bomb' ? "bg-red-900/50 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                        : card.type === 'gold' ? "bg-yellow-900/50 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                        : card.type === 'lucky_wheel' ? "bg-fuchsia-900/50 border-fuchsia-400 shadow-[0_0_15px_rgba(232,121,249,0.5)]"
                        : "bg-emerald-900/50 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                        : "bg-slate-700 border-slate-500"
                    )}>
                      {card.type === 'bomb' ? (
                        <span className="text-5xl md:text-7xl drop-shadow-lg">💣</span>
                      ) : card.type === 'gold' ? (
                        <span className="text-5xl md:text-7xl drop-shadow-lg">👑</span>
                      ) : card.type === 'lucky_wheel' ? (
                        <span className="text-5xl md:text-7xl drop-shadow-lg">🎡</span>
                      ) : card.isImage || card.content.match(/^https?:\/\//) || card.content.match(/^data:image\//) || card.content.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                        <img src={card.content} alt="card" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="drop-shadow-lg">
                          {card.content}
                        </span>
                      )}
                    </div>
                    {/* Back of card (visible initially) */}
                    <div className={cn(
                      "absolute inset-0 rounded-lg flex items-center justify-center font-black text-2xl md:text-3xl text-slate-500 transition-opacity duration-300",
                      card.isFlipped || card.isMatched ? "opacity-0" : "opacity-100"
                    )}>
                      {cardConfig.cardBackImage ? (
                        <img src={cardConfig.cardBackImage} alt="card back" className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full bg-slate-800 rounded-lg flex items-center justify-center border-2 border-slate-700">
                          {index + 1}
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Teams Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 p-4 md:p-6 z-10">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className={cn(
                'flex flex-col items-center p-3 md:p-4 rounded-2xl border-2 transition-all min-w-[140px]',
                activeTeamId === team.id ? 'border-indigo-500 bg-indigo-500/10 scale-105 shadow-lg shadow-indigo-500/20' : 'border-slate-700 bg-slate-800'
              )}
            >
              <div className="text-center w-full">
                <div className="text-xs md:text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">{team.name}</div>
                <div className="flex items-center justify-center gap-3">
                  <button 
                    onClick={() => setTeams(teams.map(t => t.id === team.id ? { ...t, score: t.score - 5 } : t))}
                    className="w-8 h-8 rounded-full bg-slate-700 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-colors text-slate-400"
                    title="Trừ 5 điểm"
                  >
                    -
                  </button>
                  <div className="text-2xl md:text-3xl font-black text-white min-w-[3ch]">{team.score}</div>
                  <button 
                    onClick={() => setTeams(teams.map(t => t.id === team.id ? { ...t, score: t.score + 5 } : t))}
                    className="w-8 h-8 rounded-full bg-slate-700 hover:bg-emerald-500/20 hover:text-emerald-400 flex items-center justify-center transition-colors text-slate-400"
                    title="Cộng 5 điểm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
