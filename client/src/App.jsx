import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Watch from "./pages/Watch";
import SignIn from "./pages/SignIn";
import CreateChannel from "./pages/CreateChannel";
import Channel from "./pages/Channel";
import EditVideo from "./pages/EditVideo";
import AddVideo from "./pages/AddVideo";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/watch/:id" element={<Watch />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/my-channel" element={<Channel />} />
        <Route path="/channel/:id" element={<Channel />} />
        <Route path="/create-channel" element={<CreateChannel />} />
        <Route path="/edit-video/:id" element={<EditVideo />} />
        <Route path="/add-video" element={<AddVideo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
