import { Navigate, useLocation } from "react-router-dom";
import { Fragment } from "react";
import { privilagedUserRoles } from "@/config";

function RouteGuard({ authenticated, user, element }) {
  const location = useLocation();

  console.log(authenticated, user, "user");

  if (!authenticated && !location.pathname.includes("/auth")) {
    return <Navigate to="/auth" />;
  }

  if (
    authenticated &&
    !privilagedUserRoles.includes(user?.role) &&
    (location.pathname.includes("instructor") ||
      location.pathname.includes("/auth"))
  ) {
    return <Navigate to="/home" />;
  }

  if (
    authenticated &&
    privilagedUserRoles.includes(user?.role) && location.pathname.includes("/auth")
  ) {
    return <Navigate to="/instructor" />;
  }

  return <Fragment>{element}</Fragment>;
}

export default RouteGuard;
