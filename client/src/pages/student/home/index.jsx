import { courseCategories } from "@/config";
import banner from "../../../assets/banner-img.png";
import { Button } from "@/components/ui/button";
import { useContext, useEffect, useCallback } from "react";
import { StudentContext } from "@/context/student-context";
import { fetchStudentViewCourseListService } from "@/services";
import { AuthContext } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";

function StudentHomePage() {
  const { studentViewCoursesList, setStudentViewCoursesList } =
    useContext(StudentContext);
  const { auth } = useContext(AuthContext);

  const navigate = useNavigate();

  function handleNavigateToCoursesPage(getCurrentId) {
    if (!getCurrentId) return;

    sessionStorage.removeItem("filters");
    const currentFilter = { category: [getCurrentId] };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate("/courses");
  }

  const fetchAllStudentViewCourses = useCallback(async () => {
    const userId = auth?.user?._id;
    if (!userId) return;

    try {
      const queryParams = new URLSearchParams({ userId }).toString();
      const response = await fetchStudentViewCourseListService(queryParams);

      if (response?.success) {
        setStudentViewCoursesList(response?.data || []);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  }, [auth, setStudentViewCoursesList]);

  useEffect(() => {
    fetchAllStudentViewCourses();
  }, [fetchAllStudentViewCourses]);

  function handleCourseNavigate(getCurrentCourseId) {
    if (!getCurrentCourseId) return;
    navigate(`/course/details/${getCurrentCourseId}`);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between py-8 px-4 lg:px-8">
        <div className="lg:w-1/2 lg:pr-12">
          <h1 className="text-4xl font-bold mb-4">Learning that gets you</h1>
          <p className="text-xl">
            Skills for your present and your future. Get Started with US
          </p>
          <Button
            onClick={() => navigate("/playground")}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Try Our Code Playground
          </Button>
        </div>
        <div className="lg:w-full mb-8 lg:mb-0">
          <img
            src={banner}
            alt="Banner"
            width={600}
            height={400}
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </section>

      {/* Blockchain Rewards Banner */}
      <section className="py-10 px-4 lg:px-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="lg:w-1/2 space-y-4">
            <h2 className="text-3xl font-bold">Earn While You Learn</h2>
            <p className="text-lg opacity-90">
              Introducing a brand-new way of rewarding students! Your
              instructors can now reward your progress and achievements with
              ERC-20 tokens on the Sepolia network.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                Blockchain Rewards
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                ERC-20 Tokens
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                Real-world Value
              </span>
            </div>
          </div>
          <div className="lg:w-1/2 flex justify-center gap-6">
            <a
              href="https://sepolia.etherscan.io/"
              target="_blank"
              className="relative w-32 h-32 bg-white/10 rounded-lg p-4 transform hover:scale-105 transition-transform duration-300"
            >
              <img
                src="/ethereum.jpeg"
                alt="Ethereum"
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-2 left-0 right-0 text-center text-sm font-medium">
                Ethereum
              </div>
            </a>
            <div className="relative w-32 h-32 bg-white/10 rounded-lg p-4 transform hover:scale-105 transition-transform duration-300">
              <img
                src="/solana.png"
                alt="Solana"
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-2 left-0 right-0 text-center text-sm font-medium">
                Solana
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Categories */}
      <section className="py-8 px-4 lg:px-8 bg-gray-100">
        <h2 className="text-2xl font-bold mb-6">Course Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {courseCategories.map((categoryItem) => (
            <Button
              key={categoryItem.id}
              className="justify-start"
              variant="outline"
              onClick={() => handleNavigateToCoursesPage(categoryItem.id)}
            >
              {categoryItem.label}
            </Button>
          ))}
        </div>
      </section>

      {/* Interactive Playground */}
      <section className="py-12 px-4 lg:px-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="lg:w-1/2 space-y-4">
            <h2 className="text-3xl font-bold">Interactive Code Playground</h2>
            <p className="text-lg opacity-90">
              Experience coding in multiple languages with our interactive
              playground. Write, run, and test your code in real-time with
              support for JavaScript, Python, Java, and more.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                Real-time Execution
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                Multiple Languages
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                Instant Output
              </span>
            </div>
            <Button
              onClick={() => navigate("/playground")}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Try Code Playground
            </Button>
          </div>
          <div className="lg:w-1/2 bg-white/10 rounded-lg p-6 font-mono text-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <pre className="text-green-300">
              {`// Example JavaScript code
                  function fibonacci(n) {
                    if (n \u2264 1) return n;
                    return fibonacci(n - 1) + fibonacci(n - 2);
                  }

                  console.log(fibonacci(10));`}
            </pre>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-12 px-4 lg:px-8">
        <h2 className="text-2xl font-bold mb-6">Featured Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {studentViewCoursesList?.length > 0 ? (
            studentViewCoursesList.map((courseItem) => (
              <div
                key={courseItem?._id}
                onClick={() => handleCourseNavigate(courseItem?._id)}
                className="border rounded-lg overflow-hidden shadow cursor-pointer transition-transform transform hover:scale-105"
              >
                <img
                  src={courseItem?.image || "/default-course.jpg"}
                  alt={courseItem?.title || "Course Image"}
                  width={300}
                  height={150}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold mb-2">
                    {courseItem?.title || "Untitled Course"}
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    {courseItem?.instructorName || "Unknown Instructor"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <h1 className="font-extrabold text-center text-xl">
              No Courses Found
            </h1>
          )}
        </div>
      </section>

      {/* Upcoming Features Carousel */}
      <section className="py-12 px-4 lg:px-8 bg-gray-50">
        <h2 className="text-2xl font-bold mb-6">Upcoming Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Code Climb Card */}
          <a href="http://localhost:3000" target="_blank" className="relative h-64 group overflow-hidden rounded-lg shadow-lg">
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-300 group-hover:opacity-50"
              style={{ backgroundImage: "url(/code-climb.jpeg)" }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <h3 className="text-2xl font-bold text-black mb-2">Code-Climb</h3>
              <p className="text-black text-center px-4">where coding is fun</p>
            </div>
          </a>

          {/* Coming Soon Cards */}
          {[1, 2].map((item) => (
            <div
              key={item}
              className="relative h-64 rounded-lg shadow-lg overflow-hidden"
            >
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{
                  backgroundImage: `url(${
                    item === 1 ? "/ethereum.jpeg" : "/solana.png"
                  })`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-2xl font-bold text-black">
                  Coming Soon...
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default StudentHomePage;
