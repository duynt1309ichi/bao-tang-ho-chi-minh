import { exhibit, quizFor, room, roomNo } from '../content';
import type { RoomId } from '../content/types';
import { hints, startSession, type ShuffledQuestion } from '../quiz/session';
import type { ProgressStore } from '../storage/progress';
import { h, openOverlay } from './dom';

const LETTERS = ['A', 'B', 'C', 'D'];

const reviewLine = (id: string) => {
  const e = exhibit(id)!;
  return h('li', { class: 'hint' }, `⚑ Xem lại: ${e.title} (${roomNo(e.room)})`);
};

/** SCR-10 — trắc nghiệm một phòng (FR-16, FR-17). */
export function showQuizPanel(ui: HTMLElement, roomId: RoomId, progress: ProgressStore, onClose: () => void) {
  const r = room(roomId);
  const questions = quizFor(roomId);
  const n = questions.length;

  const counter = h('span', { class: 'muted' });
  const closeBtn = h('button', { class: 'icon-btn', 'aria-label': 'Đóng' }, '✕');
  const content = h('div', { class: 'quiz-content' });
  const dialog = h(
    'section',
    { class: 'panel panel-center quiz', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'quiz-title' },
    h('header', { class: 'panel-head' }, h('h2', { id: 'quiz-title' }, `Trắc nghiệm · ${roomNo(roomId)} — ${r.title}`), counter, closeBtn),
    content,
  );

  // Trạng thái lượt hiện tại; null = đang ở màn giới thiệu hoặc kết quả.
  let session: ShuffledQuestion[] | null = null;
  let index = 0;
  let correct = 0;
  let review: Set<string> = new Set();
  let selectByKey: ((i: number) => void) | null = null;

  const show = (...nodes: HTMLElement[]) => {
    content.replaceChildren(...nodes);
    (content.querySelector<HTMLElement>('[data-focus]') ?? content.querySelector<HTMLElement>('button, input'))?.focus();
  };

  function intro() {
    session = null;
    selectByKey = null;
    counter.textContent = '';
    const best = progress.value.quiz[roomId];
    const start = h('button', { class: 'btn primary', 'data-focus': '' }, 'Bắt đầu');
    start.addEventListener('click', begin);
    show(
      h('p', {}, `${n} câu hỏi về nội dung ${roomNo(roomId)}.`),
      h('p', { class: 'muted' }, best ? `Tốt nhất: ${best.best}/${best.total}` : 'Chưa làm'),
      best?.mastered ? h('p', { class: 'success' }, '★ Đã nắm vững') : h('span'),
      h('div', { class: 'actions' }, start),
    );
  }

  function begin() {
    session = startSession(questions, Math.random);
    index = 0;
    correct = 0;
    review = new Set();
    ask();
  }

  function ask() {
    const q = session![index];
    counter.textContent = `Câu ${index + 1}/${n}`;
    const name = `q-${q.question.id}`;
    const radios = q.options.map((text, i) => {
      const input = h('input', { type: 'radio', name, value: String(i), class: 'visually-hidden' });
      const label = h('label', { class: 'option' }, input, h('span', { class: 'letter' }, LETTERS[i]), h('span', {}, text));
      return { input, label };
    });
    const noteId = `${name}-note`;
    const submit = h('button', { class: 'btn primary', disabled: '', 'aria-describedby': noteId }, 'Trả lời');
    const note = h('p', { class: 'muted small', id: noteId }, 'Hãy chọn một đáp án.');
    const group = h('div', { class: 'options', role: 'radiogroup', 'aria-labelledby': `${name}-prompt` }, ...radios.map((x) => x.label));
    const feedback = h('div', { class: 'feedback' });
    const actions = h('div', { class: 'actions' }, note, submit);

    const chosen = () => radios.findIndex((x) => x.input.checked);
    group.addEventListener('change', () => {
      submit.disabled = chosen() < 0;
      note.hidden = !submit.disabled;
    });
    selectByKey = (i) => {
      radios[i].input.checked = true;
      radios[i].input.focus();
      group.dispatchEvent(new Event('change'));
    };

    submit.addEventListener('click', () => {
      const pick = chosen();
      if (pick < 0) return;
      selectByKey = null;
      const ok = pick === q.answer;
      if (ok) correct++;
      else q.question.exhibitIds.forEach((id) => (review.add(id), hints.add(id)));
      radios.forEach((x, i) => {
        x.input.disabled = true;
        if (i === q.answer) x.label.classList.add('correct');
        else if (i === pick) x.label.classList.add('wrong');
      });
      radios[q.answer].label.append(h('span', { class: 'mark' }, '✓'));
      if (!ok) radios[pick].label.append(h('span', { class: 'mark' }, '✗'));

      const last = index === n - 1;
      const next = h('button', { class: 'btn primary' }, last ? 'Xem kết quả' : 'Câu tiếp →');
      next.addEventListener('click', () => (last ? finish() : (index++, ask())));
      feedback.replaceChildren(
        h('p', { class: ok ? 'success' : 'danger' }, ok ? '✓ Đúng' : `✗ Sai — đáp án đúng là ${LETTERS[q.answer]}`),
        h('p', {}, q.question.explanation),
        ok ? h('span') : h('ul', { class: 'review' }, ...q.question.exhibitIds.map(reviewLine)),
      );
      actions.replaceChildren(next);
      next.focus();
    });

    show(h('p', { class: 'prompt', id: `${name}-prompt` }, q.question.prompt), group, feedback, actions);
  }

  function finish() {
    progress.saveQuiz(roomId, correct, n);
    session = null;
    counter.textContent = '';
    const again = h('button', { class: 'btn' }, 'Làm lại');
    const done = h('button', { class: 'btn primary', 'data-focus': '' }, 'Đóng');
    again.addEventListener('click', begin);
    done.addEventListener('click', close);
    show(
      h('p', { class: 'score' }, `Đúng ${correct}/${n} câu`),
      correct === n
        ? h('p', { class: 'success' }, `★ Bạn đã nắm vững ${roomNo(roomId)}!`)
        : h('div', {}, h('p', {}, 'Xem lại các hiện vật:'), h('ul', { class: 'review' }, ...[...review].map(reviewLine))),
      h('div', { class: 'actions' }, again, done),
    );
  }

  // ✕ / ESC giữa bài → hỏi trước khi thoát (MSG-16); ở màn giới thiệu và kết quả thì đóng ngay.
  function requestClose() {
    if (!session) return close();
    const stay = h('button', { class: 'btn primary' }, 'Làm tiếp');
    const leave = h('button', { class: 'btn' }, 'Thoát');
    const box = h(
      'div',
      { class: 'panel panel-center confirm', role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': 'quiz-leave' },
      h('p', { id: 'quiz-leave' }, 'Thoát bài trắc nghiệm? Kết quả lượt này sẽ không được lưu.'),
      h('div', { class: 'actions' }, leave, stay),
    );
    const closeConfirm = openOverlay(ui, box, { onEsc: () => back(), focus: stay });
    const back = () => {
      closeConfirm();
      dialog.querySelector<HTMLElement>('input:checked, .options input:not([disabled]), .actions button')?.focus();
    };
    stay.addEventListener('click', back);
    leave.addEventListener('click', () => {
      closeConfirm();
      close();
    });
  }

  closeBtn.addEventListener('click', requestClose);
  const closeOverlay = openOverlay(ui, dialog, {
    onEsc: requestClose,
    onKey: (e) => {
      if (!selectByKey || e.ctrlKey || e.metaKey || e.altKey) return;
      const i = '1234'.indexOf(e.key) >= 0 ? '1234'.indexOf(e.key) : 'abcd'.indexOf(e.key.toLowerCase());
      if (e.key.length === 1 && i >= 0) {
        e.preventDefault();
        selectByKey(i);
      }
    },
  });
  const close = () => {
    closeOverlay();
    onClose();
  };
  intro();
}
