import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Main from './pages/main/main';
import { Room } from './pages/room/room';
import { Signin } from './pages/sign-in/signin';
import { StreamCall } from '@stream-io/video-react-sdk';
import { useUser } from './user-context';
import Cookies from "universal-cookie";
import Logo from './Logo'; // Import the Logo component

function App() {
  const { call, setUser, setCall } = useUser();
  const cookies = new Cookies();

  return (
    <Router>
      <div className="app-container">
        <header>
          <Logo /> {/* Add Logo component here */}
        </header>
        <main>
          <Routes>
            <Route path='/' element={<Main />} />
            <Route path='/sign-in' element={<Signin />} />
            <Route
              path="/room/:roomId"
              element={
                call ? (
                  <StreamCall call={call}>
                    <Room />{" "}
                  </StreamCall>
                ) : (
                  <Navigate to="/" />
                )
              }
            />
          </Routes>
        </main>
        <div>
          <button
            className="logout-button"
            onClick={() => {
              cookies.remove("token");
              cookies.remove("name");
              cookies.remove("username");
              setUser(null);
              setCall(undefined);
              window.location.pathname = "/sign-in";
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </Router>
  );
}

export default App;
