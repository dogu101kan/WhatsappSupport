import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "../layouts/main/index";
import  Chat  from "../pages/chat";
import { Login } from "../pages/login";
import { Home } from "../pages/home";
import { Register } from "../pages/register";
import { NotFound } from "../pages/not-found";
// import PrivateRoute from "../components/private-route";


const routes = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        // path: "login",
        element: <Login />,
      },
      {
        path: "home",
        element: <Home />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "chat",
        element: <Chat />,
        // children: [
        //   {
        //     index: true,
        //     element: <Chat />
        //   },
        // ],
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  
]);

export default routes;
