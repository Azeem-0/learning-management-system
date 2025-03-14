import { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { nContext } from "@/context/notification-context";
import { fetchStudentsByCriteria, addStudentsToCourse } from "@/services";

function InstructorStudentSelection({ listOfCourses }) {
  const { notify } = useContext(nContext);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    if (year || branch) {
      console.log("fetching students..");
      fetchStudents();
    }
  }, [year, branch]);

  async function fetchStudents() {
    try {
      const response = await fetchStudentsByCriteria(year, branch);
      setStudents(response);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    }
  }
  
  function handleSelectAll() {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(student => student.userEmail));
    }
  }

  function handleStudentSelection(email) {
    setSelectedStudents(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  }

  async function handleAddStudents() {
    if (!selectedCourse || selectedStudents.length === 0) return;
    try {
      await addStudentsToCourse(selectedCourse._id, selectedStudents);
      notify(`Added ${selectedStudents.length} students successfully!`);
      setSelectedStudents([]);
      setIsDialogOpen(false);
    } catch (error) {
      notify(error.response?.data?.message || "Failed to add students");
    }
  }

  console.log(students,"students");
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Select onValueChange={setYear}>
          <SelectTrigger>
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1st Year</SelectItem>
            <SelectItem value="2">2nd Year</SelectItem>
            <SelectItem value="3">3rd Year</SelectItem>
            <SelectItem value="4">4th Year</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={setBranch}>
          <SelectTrigger>
            <SelectValue placeholder="Select Branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cse">CSE</SelectItem>
            <SelectItem value="ece">ECE</SelectItem>
            <SelectItem value="mech">Mech</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Students</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="outline" size="sm" onClick={handleSelectAll}>
                      {selectedStudents.length === students.length ? "Deselect All" : "Select All"}
                    </Button>
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Regd</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Year</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell>
                      <input  
                        type="checkbox"
                        checked={selectedStudents.includes(student.userEmail)}
                        onChange={() => handleStudentSelection(student.userEmail)}
                      />
                    </TableCell>
                    <TableCell>{student.userName.length > 10 ? `${student.userName.substring(0, 10)}...` : student.userName}</TableCell>
                    <TableCell>{student.regd}</TableCell>
                    <TableCell>{student.branch}</TableCell>
                    <TableCell>{student.year}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No students available for the selected criteria</p>
          )}
        </CardContent>
      </Card>

      <Button className="mt-4" onClick={() => setIsDialogOpen(true)} disabled={selectedStudents.length === 0}>
        Add Selected Students
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Course</DialogTitle>
          </DialogHeader>
          <Select onValueChange={(id) => setSelectedCourse(listOfCourses.find(c => c._id === id))}>
            <SelectTrigger>
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              {listOfCourses.map(course => (
                <SelectItem key={course._id} value={course._id}>{course.title.length > 25 ? `${course.title.substring(0, 25)}...` : course.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="mt-4" onClick={handleAddStudents}>Confirm</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InstructorStudentSelection;
