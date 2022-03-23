import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/app.css';
import Home from './pages/home';
import Publish from './pages/publish';

function App() {
  return (
    <div className="App">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:postId" element={<Home />} />
          <Route path="/publish" element={<Publish />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
