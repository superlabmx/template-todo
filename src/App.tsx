import { useState, useEffect, useCallback } from 'react';
import { Task } from './Interfaces';
import { requestAccessCode, requestToken } from './Auth';
import reactLogo from './assets/logo.svg';
import TodoList from "./TodoList";
import './App.css';

function App() {
  // Import Environment Variables
  const host = import.meta.env.VITE_HOST;
  const resource = import.meta.env.VITE_API_RESOURCE;
  const authorizer_header: string = import.meta.env.VITE_AUTHORIZER_HEADER;
  const authorizer_client_id = import.meta.env.VITE_AUTHORIZER_CLIENT_ID;
  const authorizer_redirect_url = import.meta.env.VITE_AUTHORIZER_REDIRECT_URL;
  const authorizer_url = import.meta.env.VITE_AUTHORIZER_URL;

  const [list, setList] = useState<Task[]>([]);
  const [task, setTask] = useState('');

  const fetchTodoList = useCallback(() => {
    fetch(`${host}/api/${resource}`, {
      headers: getRequestHeaders()
    }).then((response) => {
      if (response.status === 401) {
        requestAccessCode(authorizer_url, authorizer_client_id, authorizer_redirect_url);
      } else {
        return response.json();
      }
    }).then((data) => {
      setList(data ? data.Items : [])
    }).catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('code') && localStorage.getItem('code_verifier') !== null) {
      requestToken(searchParams.get('code') || '', authorizer_url, authorizer_client_id, authorizer_redirect_url);
    } else {
      fetchTodoList();
    }
  }, [fetchTodoList, requestToken]);



  const handleAddTask = () => {
    if (task.trim() !== "") {
      const new_task = { title: task };
      fetch(`${host}/api/${resource}`, {
        method: "POST",
        headers: getRequestHeaders(),
        body: JSON.stringify(new_task),
      }).then((response) => response.json())
        .then((data) => fetch(`${host}/api/${resource}/${data.id}`, { headers: getRequestHeaders() }))
        .then((response) => response.json())
        .then((data: Task) => setList([...list, data]))
        .catch((error) => console.log(error));
      setTask('');
    }
  }

  const getRequestHeaders = (params = {}) => {
    var headers: { [key: string]: string } = {
      ...params,
      "Content-Type": "application/json"
    }
    if (authorizer_header) {
      headers[authorizer_header] = localStorage.getItem('access_token') || '';
    }
    return headers;
  }

  const onDelete = (index: number, id: string) => {
    fetch(`${host}/api/${resource}/${id}`, {
      method: "DELETE",
      headers: getRequestHeaders()
    }).then(() => {
      const newTodos = [...list];
      newTodos.splice(index, 1);
      setList(newTodos);
    }).catch((error) => console.log(error));
  }

  return (
    <div>
      <div>
        <a href="https://superlab.mx" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <div className="card">
        <h1>Todo List</h1>
        <div>
          <input type="text" placeholder="Add a task" onChange={e => setTask(e.target.value)} value={task} />
          <button className="submit" onClick={handleAddTask}>
            Add
          </button>
        </div>
        <TodoList list={list} onDelete={onDelete} />
      </div>
      <p>
        Edit <code>src/App.tsx</code>
      </p>
      <p className="read-the-docs">
        Click on the Superlab logo to learn more about us!
      </p>
    </div>
  )
}

export default App
