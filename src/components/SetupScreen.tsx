import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Play, Users, HelpCircle, Sparkles, Settings, Layers, Upload } from 'lucide-react';
import { Team, Question, WheelItem, CardConfig, CardPairConfig } from '../types';
import { TEAM_COLORS } from '../constants';
import { cn } from '../utils';
import { generateOptions } from '../services/ai';

interface SetupScreenProps {
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  rewards: WheelItem[];
  setRewards: React.Dispatch<React.SetStateAction<WheelItem[]>>;
  penalties: WheelItem[];
  setPenalties: React.Dispatch<React.SetStateAction<WheelItem[]>>;
  cardConfig: CardConfig;
  setCardConfig: React.Dispatch<React.SetStateAction<CardConfig>>;
  onStart: () => void;
}

export function SetupScreen({ teams, setTeams, questions, setQuestions, rewards, setRewards, penalties, setPenalties, cardConfig, setCardConfig, onStart }: SetupScreenProps) {
  const [activeTab, setActiveTab] = useState<'teams' | 'questions' | 'wheel' | 'cards'>('teams');
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const addTeam = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const color = TEAM_COLORS[teams.length % TEAM_COLORS.length];
    setTeams([...teams, { id: newId, name: `Đội ${teams.length + 1}`, score: 0, color }]);
  };

  const removeTeam = (id: string) => {
    setTeams(teams.filter((t) => t.id !== id));
  };

  const updateTeamName = (id: string, name: string) => {
    setTeams(teams.map((t) => (t.id === id ? { ...t, name } : t)));
  };

  const addQuestion = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setQuestions([
      ...questions,
      { id: newId, text: 'Câu hỏi mới?', answer: 'Đáp án' },
    ]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(prev => prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  };

  const handleGenerateOptions = async (qId: string) => {
    setGeneratingId(qId);
    try {
      const q = questions.find(x => x.id === qId);
      if (!q) return;
      const opts = await generateOptions(q.text, q.answer);
      updateQuestion(qId, 'options', opts);
    } catch (e) {
      console.error('Lỗi tạo đáp án: ' + e);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleImageUpload = (id: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        updateQuestion(id, 'imageUrl', e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAudioUpload = (id: string, file: File) => {
    if (!file.type.startsWith('audio/')) {
      alert('Vui lòng chọn file âm thanh');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        updateQuestion(id, 'audioUrl', e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCardImageUpload = (pairId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        updatePair(pairId, 'content', e.target.result as string);
        updatePair(pairId, 'isImage', true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleWheelAudioUpload = (type: 'reward' | 'penalty', idx: number, file: File) => {
    if (!file.type.startsWith('audio/')) {
      alert('Vui lòng chọn file âm thanh');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        if (type === 'reward') {
          const newRewards = [...rewards];
          newRewards[idx].audioUrl = e.target.result as string;
          setRewards(newRewards);
        } else {
          const newPenalties = [...penalties];
          newPenalties[idx].audioUrl = e.target.result as string;
          setPenalties(newPenalties);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const updatePair = (pairId: string, field: keyof CardPairConfig, value: any) => {
    setCardConfig(prev => {
      return {
        ...prev,
        pairs: prev.pairs.map(p => p.id === pairId ? { ...p, [field]: value } : p)
      };
    });
  };

  const addPair = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setCardConfig(prev => ({
      ...prev,
      pairs: [...prev.pairs, { id: newId, content: '🌟', isImage: false }]
    }));
  };

  const removePair = (pairId: string) => {
    setCardConfig(prev => ({
      ...prev,
      pairs: prev.pairs.filter(p => p.id !== pairId)
    }));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
            THÁNH THUYẾT TRÌNH
          </h1>
          <p className="text-slate-400 text-lg">Cơ chế lật bài ăn điểm - Tư duy & Nhân phẩm!</p>
        </div>

        <div className="bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setActiveTab('teams')}
              className={cn(
                'flex-1 py-4 px-6 text-lg font-bold flex items-center justify-center gap-2 transition-colors',
                activeTab === 'teams' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50'
              )}
            >
              <Users size={24} />
              Chia Đội ({teams.length})
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={cn(
                'flex-1 py-4 px-6 text-lg font-bold flex items-center justify-center gap-2 transition-colors',
                activeTab === 'questions' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50'
              )}
            >
              <HelpCircle size={24} />
              Câu Hỏi ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('wheel')}
              className={cn(
                'flex-1 py-4 px-6 text-lg font-bold flex items-center justify-center gap-2 transition-colors',
                activeTab === 'wheel' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50'
              )}
            >
              <Settings size={24} />
              Vòng Quay
            </button>
            <button
              onClick={() => setActiveTab('cards')}
              className={cn(
                'flex-1 py-4 px-6 text-lg font-bold flex items-center justify-center gap-2 transition-colors',
                activeTab === 'cards' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50'
              )}
            >
              <Layers size={24} />
              Lật Thẻ
            </button>
          </div>

          <div className="p-6 min-h-[400px]">
            {activeTab === 'teams' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {teams.map((team, idx) => (
                  <div key={team.id} className="flex items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-700">
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center font-bold text-white', team.color)}>
                      {idx + 1}
                    </div>
                    <input
                      type="text"
                      value={team.name}
                      onChange={(e) => updateTeamName(team.id, e.target.value)}
                      className="flex-1 bg-transparent text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded px-2 py-1"
                    />
                    <button
                      onClick={() => removeTeam(team.id)}
                      className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addTeam}
                  className="w-full py-4 border-2 border-dashed border-slate-600 rounded-xl text-slate-400 hover:border-yellow-500 hover:text-yellow-500 transition-colors flex items-center justify-center gap-2 font-bold"
                >
                  <Plus size={24} /> Thêm Đội Chơi
                </button>
              </motion.div>
            )}

            {activeTab === 'questions' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-yellow-500">Danh Sách Câu Hỏi</h3>
                  <button
                    disabled={generatingId !== null}
                    onClick={async () => {
                      for (const q of questions) {
                        if (!q.options || q.options.length < 10) {
                          await handleGenerateOptions(q.id);
                        }
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-bold shadow-lg disabled:opacity-50"
                  >
                    <Sparkles size={18} />
                    {generatingId !== null ? 'Đang tạo...' : 'Tạo tất cả đáp án nhiễu'}
                  </button>
                </div>
                {questions.map((q, idx) => (
                  <div key={q.id} className="bg-slate-900 p-5 rounded-xl border border-slate-700 space-y-4 relative group">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => removeQuestion(q.id)}
                        className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-bold text-yellow-500 shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 block">Câu hỏi</label>
                          <input
                            type="text"
                            value={q.text}
                            onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                            className="w-full bg-slate-800 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-lg px-3 py-2"
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 block">Vòng</label>
                            <select
                              value={q.round || 1}
                              onChange={(e) => updateQuestion(q.id, 'round', Number(e.target.value))}
                              className="w-full bg-slate-800 text-slate-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-lg px-3 py-2"
                            >
                              <option value={1}>Vòng 1</option>
                              <option value={2}>Vòng 2</option>
                              <option value={3}>Vòng 3</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 block">Đáp án</label>
                          <input
                            type="text"
                            value={q.answer}
                            onChange={(e) => updateQuestion(q.id, 'answer', e.target.value)}
                            className="w-full bg-slate-800 text-emerald-400 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-lg px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 block">Link ảnh hoặc Tải ảnh lên</label>
                          <div 
                            className="relative flex items-center"
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                handleImageUpload(q.id, e.dataTransfer.files[0]);
                              }
                            }}
                          >
                            <input
                              type="text"
                              value={q.imageUrl || ''}
                              placeholder="https://... hoặc kéo thả ảnh vào đây"
                              onChange={(e) => updateQuestion(q.id, 'imageUrl', e.target.value)}
                              className="w-full bg-slate-800 text-slate-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-lg px-3 py-2 pr-10"
                            />
                            <label className="absolute right-2 cursor-pointer p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors">
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleImageUpload(q.id, e.target.files[0]);
                                  }
                                }}
                              />
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            </label>
                          </div>
                          {q.imageUrl && q.imageUrl.startsWith('data:image') && (
                            <div className="mt-2 text-xs text-emerald-400">Đã tải ảnh lên thành công</div>
                          )}
                        </div>

                        <div>
                          <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 block">Link Audio hoặc Tải Audio lên (Tùy chọn)</label>
                          <div 
                            className="relative flex items-center"
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                handleAudioUpload(q.id, e.dataTransfer.files[0]);
                              }
                            }}
                          >
                            <input
                              type="text"
                              value={q.audioUrl || ''}
                              placeholder="https://... hoặc kéo thả file audio vào đây"
                              onChange={(e) => updateQuestion(q.id, 'audioUrl', e.target.value)}
                              className="w-full bg-slate-800 text-slate-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-lg px-3 py-2 pr-10"
                            />
                            <label className="absolute right-2 cursor-pointer p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors">
                              <input 
                                type="file" 
                                accept="audio/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleAudioUpload(q.id, e.target.files[0]);
                                  }
                                }}
                              />
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                            </label>
                          </div>
                          {q.audioUrl && q.audioUrl.startsWith('data:audio') && (
                            <div className="mt-2 text-xs text-emerald-400">Đã tải audio lên thành công</div>
                          )}
                        </div>

                        <div>
                          <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 block">Gợi ý / Lời bài hát (Tùy chọn)</label>
                          <textarea
                            value={q.hint || ''}
                            onChange={(e) => updateQuestion(q.id, 'hint', e.target.value)}
                            className="w-full bg-slate-800 text-slate-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-lg px-3 py-2 min-h-[80px]"
                            placeholder="Nhập gợi ý hoặc lời bài hát..."
                          />
                        </div>
                        
                        {/* Options Section */}
                        {(!q.type || q.type === 'multiple_choice') && (
                          <div className="mt-4 pt-4 border-t border-slate-700">
                            <div className="flex justify-between items-center mb-3">
                              <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Các lựa chọn (10 đáp án)</label>
                              <button 
                                onClick={() => handleGenerateOptions(q.id)}
                                disabled={generatingId === q.id}
                                className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors font-bold"
                              >
                                <Sparkles size={16} />
                                {generatingId === q.id ? 'Đang tạo...' : 'Tạo bằng AI'}
                              </button>
                            </div>
                            {q.options && q.options.length > 0 ? (
                              <div className="grid grid-cols-2 gap-2">
                                {q.options.map((opt, i) => (
                                  <div key={i} className={cn("text-sm p-2 rounded-lg bg-slate-800 border flex items-center", opt === q.answer ? "border-emerald-500 text-emerald-400 font-bold" : "border-slate-700 text-slate-300")}>
                                    <span className="text-slate-500 mr-2 shrink-0">{String.fromCharCode(65 + i)}.</span>
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) => {
                                        const newOptions = [...(q.options || [])];
                                        newOptions[i] = e.target.value;
                                        updateQuestion(q.id, 'options', newOptions);
                                      }}
                                      className="bg-transparent w-full focus:outline-none"
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-500 italic bg-slate-800/50 p-3 rounded-lg border border-slate-700 border-dashed">
                                Chưa có lựa chọn trắc nghiệm. Bấm "Tạo bằng AI" để tự động sinh ra 9 đáp án sai gây nhiễu.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addQuestion}
                  className="w-full py-4 border-2 border-dashed border-slate-600 rounded-xl text-slate-400 hover:border-yellow-500 hover:text-yellow-500 transition-colors flex items-center justify-center gap-2 font-bold"
                >
                  <Plus size={24} /> Thêm Câu Hỏi
                </button>
              </motion.div>
            )}

            {activeTab === 'wheel' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-yellow-500 mb-4">Phần Thưởng (Quay khi lật đúng)</h3>
                  <div className="space-y-4">
                    {rewards.map((r, idx) => (
                      <div key={idx} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 space-y-3">
                        <div className="flex gap-3 items-center">
                          <input
                            type="text"
                            value={r.label}
                            onChange={(e) => {
                              const newRewards = [...rewards];
                              newRewards[idx].label = e.target.value;
                              setRewards(newRewards);
                            }}
                            className="flex-1 bg-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500"
                            placeholder="Tên phần thưởng"
                          />
                          <select
                            value={r.type}
                            onChange={(e) => {
                              const newRewards = [...rewards];
                              newRewards[idx].type = e.target.value as 'points' | 'action';
                              setRewards(newRewards);
                            }}
                            className="bg-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500"
                          >
                            <option value="points">Cộng điểm</option>
                            <option value="action">Hành động</option>
                          </select>
                          <input
                            type="number"
                            value={r.value}
                            onChange={(e) => {
                              const newRewards = [...rewards];
                              newRewards[idx].value = parseInt(e.target.value) || 0;
                              setRewards(newRewards);
                            }}
                            className="w-24 bg-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500"
                            placeholder="Điểm"
                          />
                          <button
                            onClick={() => setRewards(rewards.filter((_, i) => i !== idx))}
                            className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={r.audioUrl || ''}
                              onChange={(e) => {
                                const newRewards = [...rewards];
                                newRewards[idx].audioUrl = e.target.value;
                                setRewards(newRewards);
                              }}
                              className="flex-1 bg-slate-800 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500"
                              placeholder="Link Audio (Tùy chọn)"
                            />
                            <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-lg transition-colors flex items-center justify-center" title="Tải file âm thanh">
                              <input 
                                type="file" 
                                accept="audio/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleWheelAudioUpload('reward', idx, e.target.files[0]);
                                  }
                                }}
                              />
                              <Upload size={16} />
                            </label>
                          </div>
                          <input
                            type="text"
                            value={r.hint || ''}
                            onChange={(e) => {
                              const newRewards = [...rewards];
                              newRewards[idx].hint = e.target.value;
                              setRewards(newRewards);
                            }}
                            className="w-full bg-slate-800 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500"
                            placeholder="Gợi ý / Lời bài hát (Tùy chọn)"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setRewards([...rewards, { label: 'Thưởng mới', value: 10, type: 'points' }])}
                      className="text-sm flex items-center gap-1 text-yellow-500 hover:text-yellow-400 font-bold"
                    >
                      <Plus size={16} /> Thêm phần thưởng
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-red-500 mb-4">Hình Phạt (Quay khi trả lời sai)</h3>
                  <div className="space-y-4">
                    {penalties.map((p, idx) => (
                      <div key={idx} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 space-y-3">
                        <div className="flex gap-3 items-center">
                          <input
                            type="text"
                            value={p.label}
                            onChange={(e) => {
                              const newPenalties = [...penalties];
                              newPenalties[idx].label = e.target.value;
                              setPenalties(newPenalties);
                            }}
                            className="flex-1 bg-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                            placeholder="Tên hình phạt"
                          />
                          <select
                            value={p.type}
                            onChange={(e) => {
                              const newPenalties = [...penalties];
                              newPenalties[idx].type = e.target.value as 'points' | 'action';
                              setPenalties(newPenalties);
                            }}
                            className="bg-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                          >
                            <option value="points">Trừ điểm</option>
                            <option value="action">Hành động</option>
                          </select>
                          <input
                            type="number"
                            value={p.value}
                            onChange={(e) => {
                              const newPenalties = [...penalties];
                              newPenalties[idx].value = parseInt(e.target.value) || 0;
                              setPenalties(newPenalties);
                            }}
                            className="w-24 bg-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                            placeholder="Điểm"
                          />
                          <button
                            onClick={() => setPenalties(penalties.filter((_, i) => i !== idx))}
                            className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={p.audioUrl || ''}
                              onChange={(e) => {
                                const newPenalties = [...penalties];
                                newPenalties[idx].audioUrl = e.target.value;
                                setPenalties(newPenalties);
                              }}
                              className="flex-1 bg-slate-800 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
                              placeholder="Link Audio (Tùy chọn)"
                            />
                            <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-lg transition-colors flex items-center justify-center" title="Tải file âm thanh">
                              <input 
                                type="file" 
                                accept="audio/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleWheelAudioUpload('penalty', idx, e.target.files[0]);
                                  }
                                }}
                              />
                              <Upload size={16} />
                            </label>
                          </div>
                          <input
                            type="text"
                            value={p.hint || ''}
                            onChange={(e) => {
                              const newPenalties = [...penalties];
                              newPenalties[idx].hint = e.target.value;
                              setPenalties(newPenalties);
                            }}
                            className="w-full bg-slate-800 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
                            placeholder="Gợi ý / Lời bài hát (Tùy chọn)"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setPenalties([...penalties, { label: 'Phạt mới', value: -10, type: 'points' }])}
                      className="text-sm flex items-center gap-1 text-red-500 hover:text-red-400 font-bold"
                    >
                      <Plus size={16} /> Thêm hình phạt
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'cards' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-yellow-500 mb-4">Cài đặt Điểm Số Lật Thẻ</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 block">Vòng 1</label>
                      <input type="number" value={cardConfig.round1Points} onChange={e => setCardConfig({...cardConfig, round1Points: Number(e.target.value)})} className="w-full bg-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 block">Vòng 2</label>
                      <input type="number" value={cardConfig.round2Points} onChange={e => setCardConfig({...cardConfig, round2Points: Number(e.target.value)})} className="w-full bg-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 block">Vòng 3</label>
                      <input type="number" value={cardConfig.round3Points} onChange={e => setCardConfig({...cardConfig, round3Points: Number(e.target.value)})} className="w-full bg-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500" />
                    </div>
                    <div>
                      <label className="text-xs text-yellow-500 font-bold uppercase tracking-wider mb-1 block">Thẻ Vàng 👑</label>
                      <input type="number" value={cardConfig.goldPoints} onChange={e => setCardConfig({...cardConfig, goldPoints: Number(e.target.value)})} className="w-full bg-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500" />
                    </div>
                    <div>
                      <label className="text-xs text-red-500 font-bold uppercase tracking-wider mb-1 block">Thẻ Bom 💣</label>
                      <input type="number" value={cardConfig.bombPoints} onChange={e => setCardConfig({...cardConfig, bombPoints: Number(e.target.value)})} className="w-full bg-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-yellow-500 mb-4">Ảnh Mặt Sau Thẻ (Tùy chọn)</h3>
                  <input
                    type="text"
                    value={cardConfig.cardBackImage || ''}
                    onChange={(e) => setCardConfig({ ...cardConfig, cardBackImage: e.target.value })}
                    className="w-full bg-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500"
                    placeholder="https://example.com/card-back.jpg"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-yellow-500">Các cặp thẻ (Dùng chung cho các vòng)</h3>
                    <button onClick={addPair} className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold">
                      <Plus size={16} /> Thêm Cặp Thẻ
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cardConfig.pairs.map((pair, idx) => (
                      <div key={pair.id} className="flex gap-3 items-center bg-slate-900 p-3 rounded-xl border border-slate-700 relative group">
                        <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-400 shrink-0">
                          {idx + 1}
                        </div>
                        <div 
                          className="flex-1 relative flex items-center"
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              handleCardImageUpload(pair.id, e.dataTransfer.files[0]);
                            }
                          }}
                        >
                          <input
                            type="text"
                            value={pair.content}
                            onChange={(e) => updatePair(pair.id, 'content', e.target.value)}
                            className="w-full bg-slate-800 text-slate-200 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-yellow-500"
                            placeholder={pair.isImage ? "Link ảnh hoặc kéo thả ảnh" : "Nội dung (Text/Emoji)"}
                          />
                          <label className="absolute right-2 cursor-pointer p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors">
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleCardImageUpload(pair.id, e.target.files[0]);
                                }
                              }}
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                          </label>
                        </div>
                        <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pair.isImage}
                            onChange={(e) => updatePair(pair.id, 'isImage', e.target.checked)}
                            className="rounded bg-slate-800 border-slate-600 text-yellow-500 focus:ring-yellow-500"
                          />
                          Là Ảnh
                        </label>
                        <button
                          onClick={() => removePair(pair.id)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="p-6 bg-slate-800 border-t border-slate-700">
            <button
              onClick={onStart}
              disabled={teams.length < 2 || questions.length === 0}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-slate-900 font-black text-2xl rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play fill="currentColor" size={28} />
              BẮT ĐẦU CHƠI
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
