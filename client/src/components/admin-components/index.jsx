"use client";

import React, { useContext, useState, useRef } from "react";
import Papa from "papaparse";
import axiosInstance from "@/api/axiosInstance";
import { columnHeadings } from "../../utils/constants/bulkColumnHeadings";
import { nContext } from "../../context/notification-context";

function AdminBulkRegisterPage() {
  const { notify } = useContext(nContext);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    client_format: "",
    format: "json",
    dataText: "",
    data: null,
    bulk: true,
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleParsing = (e) => {
    if (formData.client_format === "") {
      notify("Choose file format first");
      return;
    }

    const { name, value } = e.target;
    const columnH =
      formData.client_format === "tsv"
        ? columnHeadings.join("\t")
        : columnHeadings.join(",");
    const formattedValue =
      formData.client_format === "tsv"
        ? value.replace(/ {4}/g, "\t")
        : value;

    const bulkDataString = `${columnH}\n${formattedValue}`;

    Papa.parse(bulkDataString, {
      header: true,
      skipEmptyLines: true,
      delimiter: formData.client_format === "tsv" ? "\t" : ",",
      complete: (results) => {
        setFormData({
          ...formData,
          data: results.data,
          dataText: value,
        });
      },
      error: () => {
        notify("Parsing error, Please check your data.");
      },
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Auto-detect format from file extension if not already set
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!formData.client_format && (fileExtension === 'csv' || fileExtension === 'tsv')) {
      setFormData(prev => ({ ...prev, client_format: fileExtension }));
    } else if (!formData.client_format) {
      notify("Choose file format first");
      fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);

    const fileFormat = formData.client_format ||
      (fileExtension === 'csv' || fileExtension === 'tsv' ? fileExtension : 'csv');

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target.result;

      // Update the text area with file content
      setFormData(prev => ({
        ...prev,
        dataText: fileContent
      }));

      // Parse the file
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        delimiter: fileFormat === "tsv" ? "\t" : ",",
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setFormData(prev => ({
              ...prev,
              data: results.data
            }));
            notify("File uploaded successfully!");
          } else {
            notify("No valid data found in file");
          }
          setIsUploading(false);
        },
        error: (error) => {
          console.error("Parse error:", error);
          notify("Parsing error, Please check your file format.");
          setIsUploading(false);
        }
      });
    };

    reader.onerror = () => {
      notify("Error reading file");
      setIsUploading(false);
    };

    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.data || formData.data.length === 0) {
      notify("No data to submit. Please upload or paste data first.");
      return;
    }

    try {
      // Create submission payload
      const payload = {
        client_format: formData.client_format,
        format: "json",
        data: formData.data,
        bulk: true
      };

      const response = await axiosInstance.post("/auth/bulk-register", payload);
      console.log("Response:", response.data.message);
      notify(response.data.message);

      // Reset form after successful submission
      setFormData({
        client_format: "",
        dataText: "",
        data: null,
        bulk: true,
        format: "json",
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error:", error);
      notify(error.response?.data?.message || "Registration failed");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      // Set this file to the file input
      if (fileInputRef.current) {
        // This doesn't work directly in modern browsers for security reasons
        // But we can still process the file
        handleFileUpload({ target: { files } });
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary p-6">
      <div className="max-w-3xl w-full mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Bulk Registration
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Select File Format*
            </label>
            <select
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              id="client_format"
              name="client_format"
              value={formData.client_format}
              onChange={handleChange}
              required
            >
              <option value="">Choose your file format*</option>
              <option value="csv">CSV</option>
              <option value="tsv">TSV</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Make sure the file has the correct column headings: {columnHeadings.join(", ")}
            </p>
          </div>

          <div
            className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <div className="flex flex-col items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">CSV or TSV files only</p>
              <input
                type="file"
                className="hidden"
                accept=".csv,.tsv"
                onChange={handleFileUpload}
                ref={fileInputRef}
              />
            </div>
          </div>

          <div className="text-center my-4">
            <span className="text-gray-500 text-sm bg-white px-2 relative inline-block">OR</span>
            <hr className="border-t border-gray-300 absolute w-full left-0" style={{ top: '50%', zIndex: -1 }} />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Paste Your Data Here
            </label>
            <textarea
              className="w-full p-3 border rounded-md h-40 focus:outline-none focus:ring-2 focus:ring-primary"
              id="data"
              name="data"
              value={formData.dataText}
              onChange={handleParsing}
              placeholder="Paste CSV or TSV data here..."
            />
          </div>

          {isUploading && (
            <div className="text-center p-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Processing file...</p>
            </div>
          )}

          {formData.data && formData.data.length > 0 && (
            <div className="overflow-x-auto border rounded-md p-4 bg-gray-50">
              <h6 className="text-lg font-semibold text-gray-700 mb-3">
                Top {Math.min(5, formData.data.length)} Records as Reference
              </h6>
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {columnHeadings.map((heading, index) => (
                      <th
                        key={index}
                        className="border border-gray-300 px-2 py-2 text-center font-semibold"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {formData.data.slice(0, 5).map((row, index) => (
                    <tr key={index} className="text-center">
                      {columnHeadings.map((col, i) => (
                        <td key={i} className="border border-gray-300 px-2 py-2">
                          {row[col] ? (row[col].length > 10 ? row[col].substring(0, 10) + "..." : row[col]) : ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 text-gray-600 text-sm">
                Total records: {formData.data.length}
              </p>
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-3 rounded-md transition ${!formData.data || formData.data.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary/90"
              }`}
            disabled={!formData.data || formData.data.length === 0}
          >
            {formData.data && formData.data.length > 0
              ? `Register All (${formData.data.length} users)`
              : "Register All"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminBulkRegisterPage;