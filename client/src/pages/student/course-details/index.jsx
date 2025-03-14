import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import VideoPlayer from "@/components/video-player";
import { StudentContext } from "@/context/student-context";
import { fetchStudentViewCourseDetailsService } from "@/services";
import { CheckCircle, Globe, Users } from "lucide-react";
import { useContext, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";

function StudentViewCourseDetailsPage() {
  const {
    studentViewCourseDetails,
    setStudentViewCourseDetails,
    currentCourseDetailsId,
    setCurrentCourseDetailsId,
    loadingState,
    setLoadingState,
  } = useContext(StudentContext);

  const { id } = useParams();
  const location = useLocation();
  const [selectedVideo, setSelectedVideo] = useState(null);

  async function fetchStudentViewCourseDetails() {
    const response = await fetchStudentViewCourseDetailsService(currentCourseDetailsId);

    if (response?.success) {
      setStudentViewCourseDetails(response?.data);
      setLoadingState(false);
    } else {
      setStudentViewCourseDetails(null);
      setLoadingState(false);
    }
  }

  useEffect(() => {
    if (currentCourseDetailsId !== null) fetchStudentViewCourseDetails();
  }, [currentCourseDetailsId]);

  useEffect(() => {
    if (id) setCurrentCourseDetailsId(id);
  }, [id]);

  useEffect(() => {
    if (!location.pathname.includes("course/details")) {
      setStudentViewCourseDetails(null);
      setCurrentCourseDetailsId(null);
    }
  }, [location.pathname]);

  if (loadingState) return <Skeleton />;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-gray-900 text-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-4">{studentViewCourseDetails?.title}</h1>
        <p className="text-lg mb-4">{studentViewCourseDetails?.subtitle}</p>
        <div className="flex flex-wrap items-center space-x-6 text-sm">
          <span>Instructor: <strong>{studentViewCourseDetails?.instructorName}</strong></span>
          <span>Created On: <strong>{studentViewCourseDetails?.date.split("T")[0]}</strong></span>
          <span className="flex items-center"><Globe className="mr-1 h-4 w-4" /> {studentViewCourseDetails?.primaryLanguage}</span>
          <span className="flex items-center"><Users className="mr-1 h-4 w-4" /> {studentViewCourseDetails?.students.length} Students</span>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 mt-8">
        <main className="md:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>What you'll learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {studentViewCourseDetails?.objectives.split(",").map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Course Description</CardTitle>
            </CardHeader>
            <CardContent>{studentViewCourseDetails?.description}</CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              {studentViewCourseDetails?.curriculum.map((item, index) => (
                <div key={index} className="mb-4">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span>{item.title}</span>
                    <Button variant="outline" className="text-sm" onClick={() => selectedVideo === item.videoUrl ? setSelectedVideo(null) : setSelectedVideo(item.videoUrl)}>
                      {selectedVideo === item.videoUrl ? "Close" : "Watch"}
                    </Button>
                  </div>
                  {selectedVideo === item.videoUrl && (
                    <div className="mt-2 rounded-lg overflow-hidden shadow-md">
                      <VideoPlayer url={selectedVideo} width="100%" height="250px" />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </main>
        
        <aside className="md:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <img src={studentViewCourseDetails?.image} alt="Course Thumbnail" className="w-full rounded-lg shadow-md" />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

export default StudentViewCourseDetailsPage;
