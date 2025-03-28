import { GraduationCap, TvMinimalPlay } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import { privilagedUserRoles } from "@/config";

function StudentViewCommonHeader() {
  const navigate = useNavigate();
  const { resetCredentials, auth } = useContext(AuthContext);

  function handleLogout() {
    resetCredentials();
    localStorage.clear();
  }

  console.log("auth : ", auth);

  return (
    <header className="flex items-center justify-between p-4 border-b relative">
      <div className="flex items-center space-x-4">
        <Link to="/home" className="flex items-center hover:text-black">
          <GraduationCap className="h-8 w-8 mr-4 " />
          <span className="font-extrabold md:text-xl text-[14px]">
            BYTE LEARN
          </span>
        </Link>

        {privilagedUserRoles.includes(auth?.user?.role) ? <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            onClick={() => {
              location.pathname.includes("/instructor")
                ? null
                : navigate("/instructor");
            }}
            className="text-[14px] md:text-[16px] font-medium"
          >
            Instructor
          </Button>
        </div> : null}

        {auth?.user?.role === "student" ? <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            onClick={() => {
              location.pathname.includes("/student-progress")
                ? null
                : navigate("/student-progress");
            }}
            className="text-[14px] md:text-[16px] font-medium"
          >
            Progress Dashboard
          </Button>
        </div> : null}

      </div>
      <div className="flex items-center space-x-4">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm md:text-base">
              Hello, <span className="font-bold text-indigo-600">{auth?.user?.userName?.length > 10 ? `${auth?.user?.userName.substring(0, 10)}...` : auth?.user?.userName || "Scholar"}!</span>
              <span className="hidden md:inline ml-1 italic text-gray-600">Ready to learn something amazing today?</span>
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              onClick={() => {
                location.pathname.includes("/courses")
                  ? null
                  : navigate("/courses");
              }}
              className="text-[14px] md:text-[16px] font-medium"
            >
              Explore Courses
            </Button>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              onClick={handleLogout}
            >Sign Out</Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default StudentViewCommonHeader;
