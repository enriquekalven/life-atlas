import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, HelpCircle, X, XCircle } from 'lucide-react';
import { AnimalRecord } from '../types/atlas';

interface QuizModalProps {
  animal: AnimalRecord;
  isOpen: boolean;
  onClose: () => void;
  onCompleteBadge: (animalId: string) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  animal,
  isOpen,
  onClose,
  onCompleteBadge,
}) => {
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const questions = animal.quiz;
  const currentQ = questions[questionIdx] || questions[0];

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (idx === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (questionIdx + 1 < questions.length) {
      setQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setFinished(true);
      onCompleteBadge(animal.id);
    }
  };

  const handleReset = () => {
    setQuestionIdx(0);
    setSelectedOption(null);
    setScore(0);
    setFinished(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
    >
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 id="quiz-modal-title" className="text-base font-bold text-white">
              Young Scientist Challenge: {animal.commonName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quiz dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {finished ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center mx-auto">
                <Award className="w-9 h-9 text-amber-300" />
              </div>
              <h3 className="text-xl font-extrabold text-white">
                Explorer Badge Unlocked!
              </h3>
              <p className="text-sm text-slate-300">
                You scored{' '}
                <strong className="text-emerald-400">
                  {score} / {questions.length}
                </strong>{' '}
                on the <strong>{animal.commonName}</strong> Anatomy &amp; Paleontology
                Challenge!
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                >
                  Replay Quiz
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer"
                >
                  Continue Exploring 3D Atlas
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-semibold text-amber-300">
                  <HelpCircle className="w-4 h-4" />
                  Question {questionIdx + 1} of {questions.length}
                </span>
                <span>Score: {score}</span>
              </div>

              <p className="text-sm sm:text-base font-bold text-white leading-snug">
                {currentQ.question}
              </p>

              <div className="space-y-2">
                {currentQ.options.map((opt, idx) => {
                  const isChosen = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctIndex;
                  let btnStyle =
                    'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-600';

                  if (selectedOption !== null) {
                    if (isCorrect) {
                      btnStyle =
                        'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-semibold';
                    } else if (isChosen) {
                      btnStyle =
                        'bg-rose-950/80 border-rose-500 text-rose-200';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition flex items-start justify-between gap-2 cursor-pointer ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {selectedOption !== null && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      {selectedOption !== null && isChosen && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedOption !== null && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
                  <div>
                    <strong className="text-amber-300">Science Explanation: </strong>
                    {currentQ.explanation}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer"
                    >
                      {questionIdx + 1 < questions.length
                        ? 'Next Question →'
                        : 'Claim Explorer Badge →'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
