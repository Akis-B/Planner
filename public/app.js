import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const configElement = document.getElementById("firebase-config");
let firebaseConfig;
try {
  firebaseConfig = JSON.parse(configElement.textContent);
} catch (error) {
  renderError("The Firebase configuration block is missing or malformed.");
  throw error;
}

const missingConfig = Object.values(firebaseConfig).some((value) =>
  typeof value === "string" ? value.startsWith("YOUR_") : !value
);

if (missingConfig) {
  renderError(
    "Update the Firebase configuration inside index.html before using the planner."
  );
  throw new Error("Firebase configuration not provided");
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tasksCollection = collection(db, "tasks");

const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");

function renderError(message) {
  const container = document.createElement("div");
  container.className = "empty";
  container.textContent = message;
  document.querySelector(".app__tasks").appendChild(container);
}

function formatDueDate(task) {
  if (!task.dueAt) {
    return "No due date";
  }

  const date = task.dueAt instanceof Timestamp ? task.dueAt.toDate() : task.dueAt;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: task.timeProvided ? "short" : undefined,
  }).format(date);
}

function renderTasks(tasks) {
  taskList.innerHTML = "";

  if (!tasks.length) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  for (const task of tasks) {
    const li = document.createElement("li");
    li.className = `task${task.completed ? " task--complete" : ""}`;

    const top = document.createElement("div");
    top.className = "task__top";

    const title = document.createElement("h3");
    title.className = "task__title";
    title.textContent = task.title;
    top.appendChild(title);

    const actions = document.createElement("div");
    actions.className = "task__actions";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.textContent = task.completed ? "Mark active" : "Mark done";
    toggle.addEventListener("click", () => toggleTask(task));
    actions.appendChild(toggle);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => deleteTask(task));
    actions.appendChild(remove);

    top.appendChild(actions);
    li.appendChild(top);

    if (task.details) {
      const details = document.createElement("p");
      details.textContent = task.details;
      li.appendChild(details);
    }

    const meta = document.createElement("div");
    meta.className = "task__meta";
    meta.innerHTML = `<span>${formatDueDate(task)}</span>`;
    li.appendChild(meta);

    taskList.appendChild(li);
  }
}

function toTimestamp(dateValue, timeValue) {
  if (!dateValue) {
    return { dueAt: null, timeProvided: false };
  }

  const isoString = `${dateValue}T${timeValue || "00:00"}`;
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return { dueAt: null, timeProvided: false };
  }

  return { dueAt: Timestamp.fromDate(date), timeProvided: Boolean(timeValue) };
}

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(taskForm);

  const title = formData.get("title").trim();
  const details = formData.get("details").trim();
  const dateValue = formData.get("date");
  const timeValue = formData.get("time");

  if (!title) {
    return;
  }

  const { dueAt, timeProvided } = toTimestamp(dateValue, timeValue);

  await addDoc(tasksCollection, {
    title,
    details,
    completed: false,
    dueAt,
    timeProvided,
    createdAt: serverTimestamp(),
  });

  taskForm.reset();
  taskForm.title.focus();
});

function toggleTask(task) {
  const reference = doc(tasksCollection, task.id);
  updateDoc(reference, { completed: !task.completed });
}

function deleteTask(task) {
  const reference = doc(tasksCollection, task.id);
  deleteDoc(reference);
}

const tasksQuery = query(tasksCollection, orderBy("dueAt"), orderBy("createdAt"));

onSnapshot(tasksQuery, (snapshot) => {
  const tasks = snapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    ...docSnapshot.data(),
  }));

  tasks.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    const aTime = a.dueAt instanceof Timestamp ? a.dueAt.toMillis() : 0;
    const bTime = b.dueAt instanceof Timestamp ? b.dueAt.toMillis() : 0;

    if (aTime !== bTime) {
      return aTime - bTime;
    }

    return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
  });

  renderTasks(tasks);
});
