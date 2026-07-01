import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, X } from 'lucide-react';
import { useWorkoutStore } from '../store/workoutStore';
import { useToastStore } from '../store/toastStore';
import type { Exercise } from '../types/workout';

export default function TemplateModal({
  open,
  onClose,
  mondayISO,
  dateISO,
  currentExercises,
}: {
  open: boolean;
  onClose: () => void;
  mondayISO: string;
  dateISO: string;
  currentExercises: Exercise[];
}) {
  const templates = useWorkoutStore((s) => s.data.templates ?? []);
  const saveTemplate = useWorkoutStore((s) => s.saveTemplate);
  const deleteTemplate = useWorkoutStore((s) => s.deleteTemplate);
  const applyTemplateToDay = useWorkoutStore((s) => s.applyTemplateToDay);
  const showToast = useToastStore((s) => s.show);

  const [name, setName] = useState('');

  function onSave() {
    if (!name.trim() || currentExercises.length === 0) return;
    saveTemplate(name.trim(), currentExercises);
    showToast('Template saved');
    setName('');
  }

  function onApply(templateId: string, templateName: string) {
    applyTemplateToDay(mondayISO, dateISO, templateId);
    showToast(`Applied "${templateName}"`);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl border border-border bg-surface p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="m-0 text-base font-semibold">Templates</h3>
              <button onClick={onClose} className="p-1 text-text-faint hover:text-text">
                <X size={16} />
              </button>
            </div>

            <div className="mb-5">
              <label className="mb-1.5 block text-[11px] tracking-wider text-text-faint uppercase">
                Save this day as a template
              </label>
              <div className="flex gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Push Day A"
                  disabled={currentExercises.length === 0}
                  className="flex-1 rounded-md border border-border bg-surface-2 px-2.5 py-2 text-sm text-text placeholder:text-text-faint disabled:opacity-50"
                />
                <button
                  onClick={onSave}
                  disabled={!name.trim() || currentExercises.length === 0}
                  className="rounded-md border border-cyan bg-cyan px-3 text-xs font-bold text-[#04201d] hover:bg-[#4bf0e0] disabled:opacity-40"
                >
                  Save
                </button>
              </div>
              {currentExercises.length === 0 && (
                <p className="m-0 mt-1.5 text-[11px] text-text-faint">
                  Add exercises to this day before saving it as a template.
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] tracking-wider text-text-faint uppercase">
                Apply a saved template
              </label>
              {templates.length === 0 ? (
                <p className="m-0 text-xs text-text-faint">No templates saved yet.</p>
              ) : (
                <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto">
                  {templates.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between rounded-md border border-border-soft bg-surface-2 px-2.5 py-2"
                    >
                      <div>
                        <div className="text-sm font-semibold text-text">{t.name}</div>
                        <div className="text-[11px] text-text-faint">{t.exercises.length} exercises</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onApply(t.id, t.name)}
                          className="rounded-md border border-border px-2.5 py-1 text-[11px] font-semibold text-text-dim hover:border-cyan-dim hover:text-text"
                        >
                          Apply
                        </button>
                        <button
                          onClick={() => deleteTemplate(t.id)}
                          className="p-1 text-text-faint hover:text-danger"
                          title="Delete template"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
