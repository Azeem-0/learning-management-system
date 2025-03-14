import MediaProgressbar from "@/components/media-progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useContext, useRef } from "react";
import { InstructorContext } from "@/context/instructor-context";
import { mediaUploadService } from "@/services";

function CourseSettings() {
  const {
    courseLandingFormData,
    setCourseLandingFormData,
    mediaUploadProgress,
    setMediaUploadProgress,
    mediaUploadProgressPercentage,
    setMediaUploadProgressPercentage,
  } = useContext(InstructorContext);

  const fileInputRef = useRef(null);

  async function handleImageUploadChange(event) {
    const selectedImage = event.target.files[0];

    if (selectedImage) {
      const imageFormData = new FormData();
      imageFormData.append("file", selectedImage);

      try {
        setMediaUploadProgress(true);
        const response = await mediaUploadService(
          imageFormData,
          setMediaUploadProgressPercentage
        );
        if (response.success) {
          setCourseLandingFormData({
            ...courseLandingFormData,
            image: response.data.url,
          });
          setMediaUploadProgress(false);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  function handleEditImage() {
    fileInputRef.current?.click();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Settings</CardTitle>
      </CardHeader>
      <div className="p-4">
        {mediaUploadProgress ? (
          <MediaProgressbar
            isMediaUploading={mediaUploadProgress}
            progress={mediaUploadProgressPercentage}
          />
        ) : null}
      </div>
      <CardContent>
        {courseLandingFormData?.image ? (
          <div className="flex flex-col gap-3 items-center">
            <img src={courseLandingFormData.image} className="max-w-xs rounded-md" />
            <Button onClick={handleEditImage} variant="outline">Edit Image</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Label>Upload Course Image</Label>
            <Input
              ref={fileInputRef}
              onChange={handleImageUploadChange}
              type="file"
              accept="image/*"
              className="hidden"
            />
            <Button onClick={handleEditImage} variant="outline">Upload Image</Button>
          </div>
        )}
      </CardContent>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUploadChange}
      />
    </Card>
  );
}

export default CourseSettings;
