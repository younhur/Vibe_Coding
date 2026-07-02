// ============================================================
//  To-Do App - Firebase Firestore 연동 로직
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

// --- Firebase 초기화 ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const todosCol = collection(db, "todos");

// --- DOM 참조 ---
const addForm = document.getElementById("add-form");
const newTaskInput = document.getElementById("new-task");
const taskList = document.getElementById("task-list");
const emptyMsg = document.getElementById("empty-msg");
const tabs = document.querySelectorAll(".tab");
const countAll = document.getElementById("count-all");
const countTodo = document.getElementById("count-todo");
const countDone = document.getElementById("count-done");

// --- 상태 ---
let todos = []; // Firestore에서 받아온 전체 목록
let currentFilter = "all"; // all | todo | done

// ============================================================
//  1) 추가 (Create)
// ============================================================
addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = newTaskInput.value.trim();
  if (!text) return;

  try {
    await addDoc(todosCol, {
      text,
      done: false,
      createdAt: serverTimestamp(),
    });
    newTaskInput.value = "";
    newTaskInput.focus();
  } catch (err) {
    console.error("추가 실패:", err);
    alert("할 일 추가에 실패했습니다.");
  }
});

// ============================================================
//  2) 실시간 구독 (Read) - DB 변경 시 자동 렌더
// ============================================================
const q = query(todosCol, orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
  todos = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  render();
});

// ============================================================
//  3) 완료 토글 / 수정 저장 (Update)
// ============================================================
async function toggleDone(id, done) {
  await updateDoc(doc(db, "todos", id), { done: !done });
}

async function saveEdit(id, newText) {
  const text = newText.trim();
  if (!text) return;
  await updateDoc(doc(db, "todos", id), { text });
}

// ============================================================
//  4) 삭제 (Delete)
// ============================================================
async function removeTask(id) {
  if (!confirm("이 할 일을 삭제할까요?")) return;
  await deleteDoc(doc(db, "todos", id));
}

// ============================================================
//  탭(필터) 전환
// ============================================================
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentFilter = tab.dataset.filter;
    render();
  });
});

// ============================================================
//  렌더링
// ============================================================
function render() {
  // 개수 갱신
  const doneCount = todos.filter((t) => t.done).length;
  countAll.textContent = todos.length;
  countDone.textContent = doneCount;
  countTodo.textContent = todos.length - doneCount;

  // 필터 적용
  let list = todos;
  if (currentFilter === "todo") list = todos.filter((t) => !t.done);
  if (currentFilter === "done") list = todos.filter((t) => t.done);

  // 목록 그리기
  taskList.innerHTML = "";
  emptyMsg.style.display = list.length === 0 ? "block" : "none";

  list.forEach((t) => taskList.appendChild(createTaskItem(t)));
}

// 할 일 1개(li) 생성
function createTaskItem(t) {
  const li = document.createElement("li");
  li.className = "task-item" + (t.done ? " done" : "");

  // 체크박스
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = t.done;
  checkbox.addEventListener("change", () => toggleDone(t.id, t.done));

  // 텍스트
  const span = document.createElement("span");
  span.className = "task-text";
  span.textContent = t.text;

  // 수정 버튼
  const editBtn = document.createElement("button");
  editBtn.className = "icon-btn";
  editBtn.textContent = "✏️";
  editBtn.title = "수정";
  editBtn.addEventListener("click", () => enterEditMode(li, t));

  // 삭제 버튼
  const delBtn = document.createElement("button");
  delBtn.className = "icon-btn";
  delBtn.textContent = "🗑️";
  delBtn.title = "삭제";
  delBtn.addEventListener("click", () => removeTask(t.id));

  li.append(checkbox, span, editBtn, delBtn);
  return li;
}

// 인라인 편집 모드
function enterEditMode(li, t) {
  li.innerHTML = "";

  const input = document.createElement("input");
  input.className = "task-edit-input";
  input.value = t.text;

  const saveBtn = document.createElement("button");
  saveBtn.className = "icon-btn";
  saveBtn.textContent = "💾";
  saveBtn.title = "저장";

  const cancelBtn = document.createElement("button");
  cancelBtn.className = "icon-btn";
  cancelBtn.textContent = "✖️";
  cancelBtn.title = "취소";

  const commit = () => saveEdit(t.id, input.value); // onSnapshot이 자동 재렌더
  saveBtn.addEventListener("click", commit);
  cancelBtn.addEventListener("click", render); // 원상복구
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") render();
  });

  li.append(input, saveBtn, cancelBtn);
  input.focus();
  input.select();
}
