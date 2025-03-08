"use client";

import React, { useContext, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import Papa from "papaparse";
// import axios from "axios";
import axiosInstance from "@/api/axiosInstance";
import { columnHeadings } from "../../utils/constants/bulkColumnHeadings";
import { nContext } from "../../context/notification-context";

function AdminBulkRegisterPage() {
  const { notify } = useContext(nContext);
  const [formData, setFormData] = useState({
    client_format : "",
    format: "json",
    dataText: "",
    data: null,
    bulk: true,
  });

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
    } else {
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
            [name]: results.data,
            dataText: value,
          });
        },
        error: () => {
          notify("Parsing error, Please check your data.");
        },
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    const response = await axiosInstance.post("/auth/bulk-register",formData);
    console.log("Response:", response.data.message);
    notify(response.data.message);   
    setFormData({
      client_format: "",
      dataText: "",
      data: null,
      bulk: true,
      format: "json",
    });
    } catch (error) {
      console.error("Error:", error);
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
            >
              <option value="">Choose your file format*</option>
              <option value="csv">CSV</option>
              <option value="tsv">TSV</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Paste Your File Here*
            </label>
            <textarea
              className="w-full p-3 border rounded-md h-40 focus:outline-none focus:ring-2 focus:ring-primary"
              id="data"
              name="data"
              value={formData.dataText}
              onChange={handleParsing}
              required
            />
          </div>
          {formData.data && (
            <div className="overflow-x-auto border rounded-md p-4 bg-gray-50">
              <h6 className="text-lg font-semibold text-gray-700 mb-3">
                Top 5 Records as Reference
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
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-md hover:bg-primary/90 transition"
          >
            Register All
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminBulkRegisterPage;
