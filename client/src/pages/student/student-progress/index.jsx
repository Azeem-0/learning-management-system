import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import axiosInstance from "@/api/axiosInstance";
import { AuthContext } from "@/context/auth-context";
import { Loader2 } from "lucide-react";

const StudentProgressAnalysis = () => {
    const { auth } = useContext(AuthContext);
    const [progressData, setProgressData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStudentProgress = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/students/progress-analysis/${auth?.user?._id}`);
            console.log(response);
            setProgressData(response?.data);
            setError(null);
        } catch (error) {
            console.error("Error fetching student progress:", error);
            setError("Failed to load progress data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (auth?.user?._id) {
            fetchStudentProgress();
        }
    }, [auth?.user?._id]);

    const quizPerformanceData = [
        { name: 'Total Quizzes', value: progressData?.totalQuizzes || 0 },
        { name: 'Passed Quizzes', value: progressData?.totalPassed || 0 }
    ];

    const courseCompletionData = [
        { name: 'Completed', value: progressData?.completedCourses || 0 },
        { name: 'Ongoing', value: (progressData?.totalCourses - progressData?.completedCourses) || 0 }
    ];

    const COLORS = ['#0088FE', '#00C49F'];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <Card className="w-full max-w-2xl mx-auto mt-8">
                <CardHeader>
                    <CardTitle className="text-red-500">Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{error}</p>
                    <Button onClick={fetchStudentProgress} className="mt-4">
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Student Progress Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Performance Overview */}
                        <Card className="flex flex-col justify-center">
                            <CardHeader>
                                <CardTitle>Performance Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p>Courses Completed: {progressData?.completedCourses} / {progressData?.totalCourses}</p>
                                    <p>Quizzes Attempted: {progressData?.totalQuizzes}</p>
                                    <p>Average Quiz Score: {progressData?.averageQuizScore}%</p>
                                    <p>Total Time Spent: {progressData?.totalTimeSpent} hrs</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quiz Performance Chart */}
                        <Card className=" flex flex-col justify-center items-center">
                            <CardHeader>
                                <CardTitle>Quiz Performance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <PieChart width={300} height={200}>
                                    <Pie
                                        data={quizPerformanceData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {quizPerformanceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </CardContent>
                        </Card>
                    </div>

                    {/* AI Insights */}
                    {progressData?.feedback && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>AI Insights</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>{progressData.feedback}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Strengths and Weaknesses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Strengths</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {progressData?.strengths.length > 0 ? (
                                    <ul className="list-disc pl-5">
                                        {progressData.strengths.map((strength, index) => (
                                            <li key={index}>{strength}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No specific strengths identified yet.</p>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Areas for Improvement</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {progressData?.weaknesses.length > 0 ? (
                                    <ul className="list-disc pl-5">
                                        {progressData.weaknesses.map((weakness, index) => (
                                            <li key={index}>{weakness}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No specific areas for improvement identified.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default StudentProgressAnalysis;