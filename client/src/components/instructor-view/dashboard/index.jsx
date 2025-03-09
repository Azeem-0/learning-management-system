import { useContext, useState, useMemo } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users } from "lucide-react";
import { addStudentsToCourse } from "@/services";
import { nContext } from "@/context/notification-context";

function InstructorDashboard({ listOfCourses }) {
  const { notify } = useContext(nContext);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [studentEmail, setStudentEmail] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Memoize total students calculation to prevent unnecessary recalculations
  const { totalStudents } = useMemo(() => {
    return listOfCourses.reduce(
      (acc, course) => {
        const studentCount = course.students?.length || 0;
        acc.totalStudents += studentCount;
        return acc;
      },
      { totalStudents: 0 }
    );
  }, [listOfCourses]);

  function handleAddStudent(course) {
    setSelectedCourse(course);
    setIsDialogOpen(true);
  }

  async function handleStudentSubmit() {
    if (selectedCourse && studentEmail.trim()) {
      const emails = studentEmail.split(",").map(email => email.trim()); // Split emails and remove spaces
  
      try {
        await addStudentsToCourse(selectedCourse._id, emails); // Send all emails at once
        setStudentEmail(""); 
        setIsDialogOpen(false);
        notify(`Successfully added ${emails.length} students!`);
      } catch (error) {
        notify(error.response?.data?.message || "Failed to add students");
      }
    }
  }

  // Store totalStudents in a variable and use it in the config array
  const config = [
    {
      icon: Users,
      label: "Total Students",
      value: totalStudents, // Now using memoized value
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {config.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Number of Students</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listOfCourses.map((course, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{course.students?.length || 0}</TableCell> 
                    <TableCell>
                      <Button size="sm" onClick={() => handleAddStudent(course)}>
                        Add Student
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>  
            </Table>
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
}

export default InstructorDashboard;
