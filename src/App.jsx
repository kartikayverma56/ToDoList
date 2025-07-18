import { useEffect, useState } from "react"
import { db } from "./firebase"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore"

import "./styles.css"

export default function App() {
  const [tasks, setTasks] = useState([])
  const [text, setText] = useState("")
  const [filter, setFilter] = useState("all")
  const tasksRef = collection(db, "tasks")

  useEffect(() => {
    const q = query(tasksRef, orderBy("timestamp"))
    const unsub = onSnapshot(q, snapshot => {
      const arr = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setTasks(arr)
    })
    return unsub
  }, [])

  const addTask = async e => {
    e.preventDefault()
    if (text.trim() === "") return
    await addDoc(tasksRef, {
      text,
      done: false,
      timestamp: serverTimestamp()
    })
    setText("")
  }

  const toggleTask = async t => {
    await updateDoc(doc(db, "tasks", t.id), { done: !t.done })
  }

  const editTask = async (t, newText) => {
    await updateDoc(doc(db, "tasks", t.id), { text: newText })
  }

  const deleteTask = async t => {
    await deleteDoc(doc(db, "tasks", t.id))
  }

  const filtered = tasks.filter(t =>
    filter === "all" ? true : filter === "active" ? !t.done : t.done
  )

  return (
    <div className="main">
      <h2>Todo List</h2>
      <form onSubmit={addTask}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Enter task"
        />
        <button>Add</button>
      </form>

      <div className="tabs">
        {["all", "active", "done"].map(f => (
          <button
            key={f}
            className={filter === f ? "on" : ""}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <ul>
        {filtered.map(t => (
          <li key={t.id} className={t.done ? "done" : ""}>
            <input
              type="text"
              value={t.text}
              onChange={e => editTask(t, e.target.value)}
            />
            <button onClick={() => toggleTask(t)}>
              {t.done ? "Undo" : "Done"}
            </button>
            <button onClick={() => deleteTask(t)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
