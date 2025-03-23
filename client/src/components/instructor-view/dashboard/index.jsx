import { useContext, useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, BookOpen } from "lucide-react";
import { addStudentsToCourse, fetchStudentsByCriteria } from "@/services";
import { nContext } from "@/context/notification-context";
import InstructorStudentSelection from "./student-selection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AwardERC20 from "./award-erc20";
import CheckBalance from "./check-balance";
import { ConnectButton } from "@rainbow-me/rainbowkit";

function InstructorDashboard({ listOfCourses }) {
  const { notify } = useContext(nContext);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [studentEmail, setStudentEmail] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [totalStudents, setTotalStudents] = useState(0);

  // Memoize total students calculation to prevent unnecessary recalculations

  console.log(listOfCourses, "list of courses");

  useEffect(() => {
    fetchTotalStudents();
  }, []);

  async function fetchTotalStudents() {
    try {
      const response = await fetchStudentsByCriteria("", "");
      console.log(response, "response");
      setTotalStudents(response.length);
    } catch (error) {
      console.error("Error fetching total students:", error);
      setTotalStudents(0);
    }
  }

  async function handleStudentSubmit() {
    if (selectedCourse && studentEmail.trim()) {
      const emails = studentEmail.split(",").map((email) => email.trim());
      try {
        await addStudentsToCourse(selectedCourse._id, emails);
        setStudentEmail("");
        setIsDialogOpen(false);
        notify(`Successfully added ${emails.length} students!`);
      } catch (error) {
        notify(error.response?.data?.message || "Failed to add students");
      }
    }
  }

  // Dashboard stats
  const stats = [
    {
      icon: Users,
      label: "Total Students",
      value: totalStudents,
    },
    {
      icon: BookOpen,
      label: "Total Courses",
      value: listOfCourses.length,
    },
  ];

  async function handleViewCourse(course) {
    window.location.href = `/course/details/${course._id}`;
  }

  return (
    <div>
      <Tabs defaultValue="overview" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="addStudents">Add Students</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="awardTokens">Faucet</TabsTrigger>
          <TabsTrigger value="checkRewards">Check Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {stats.map((item, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {item.label}
                  </CardTitle>
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-semibold">{item.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="addStudents">
          <Card>
            <CardHeader>
              <CardTitle>Add Students To Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <InstructorStudentSelection listOfCourses={listOfCourses} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="awardTokens">
          <AwardERC20 />
        </TabsContent>

        <TabsContent value="checkRewards">
          <CheckBalance />
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Course Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Go To Course</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listOfCourses.map((course, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {course.title.length > 15
                            ? `${course.title.slice(0, 15)}...`
                            : course.title}
                        </TableCell>
                        <TableCell>{course.instructorName || "N/A"}</TableCell>
                        <TableCell>
                          {course.category || "Uncategorized"}
                        </TableCell>
                        <TableCell>{course.level || "Not specified"}</TableCell>
                        <TableCell>{course.students?.length || 0}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewCourse(course)}
                          >
                            Explore
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Student to {selectedCourse?.title}</DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Enter student emails (comma-separated)"
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value)}
          />

          <Button className="mt-4" onClick={handleStudentSubmit}>
            Confirm
          </Button>
        </DialogContent>
      </Dialog>
      <div className="absolute top-0 right-0 m-2">
        <ConnectButton />
      </div>
    </div>
  );
}

export default InstructorDashboard;
