"use client";

import CommonForm from "@/components/common-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signInFormControls } from "@/config";
import { AuthContext } from "@/context/auth-context";
import { GraduationCap } from "lucide-react";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { nContext } from "@/context/notification-context";

function AuthPage() {
  const {
    signInFormData,
    setSignInFormData,
    handleLoginUser,
  } = useContext(AuthContext);

  function checkIfSignInFormIsValid() {
    return (
      signInFormData &&
      signInFormData.userEmail !== "" &&
      signInFormData.password !== ""
    );
  }

  const { notify } = useContext(nContext);

  return (
    <div className="flex flex-col min-h-screen bg-secondary">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white shadow-sm">
        <Link to={"/"} className="flex items-center justify-center">
          <GraduationCap className="h-8 w-8 mr-4 text-primary" />
          <span className="font-extrabold text-xl text-primary">
            BYTE LEARN
          </span>
        </Link>
      </header>
      <div className="flex items-center justify-center flex-1 p-4">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome to BYTE LEARN
            </h1>
            <p className="text-gray-600">
              Your journey to knowledge starts here
            </p>
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader className="bg-primary text-white rounded-t-lg">
              <CardTitle>Sign in to your account</CardTitle>
              <CardDescription className="text-secondary opacity-90">
                Enter your email and password to access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6 bg-white rounded-b-lg">
              <CommonForm
                formControls={signInFormControls}
                buttonText={"Sign In"}
                formData={signInFormData}
                setFormData={setSignInFormData}
                isButtonDisabled={!checkIfSignInFormIsValid()}
                handleSubmit={handleLoginUser}
                buttonClassName="bg-primary hover:bg-primary/90 text-white"
              />
            </CardContent>
          </Card>
        </div>
      </div>
      <footer className="py-4 text-center text-sm text-gray-600 bg-white border-t">
        <p>© {new Date().getFullYear()} MVGR LEARN. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default AuthPage;

