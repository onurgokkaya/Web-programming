"use client";
import { useEffect, useState } from "react";
import { languages } from "@/app/page";
import MutercimLogo from "@/Components/MutercimLogo";

export default function UserHistoryPage({ params }) {
  const { mail } = params;
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTextId, setExpandedTextId] = useState(null);

  useEffect(() => {
    if (!mail) return;

    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/history/credentials/${mail}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setHistory(data.history);
      } catch (err) {
        console.error("Failed to fetch user history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [mail]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );

  const truncateText = (text, length) => {
    return text.length > length ? text.slice(0, length) + "..." : text;
  };

  const formatDate = (dateString) => {
    return dateString.slice(0, 10);
  };

  const toggleText = (id) => {
    setExpandedTextId(expandedTextId === id ? null : id);
  };

  return (
    <>
      <div className="sm:pt-4 sm:pl-4 md:pt-8 md:pl-8">
        <MutercimLogo />
      </div>

      <div className="w-2/3 mx-auto p-6 bg-white shadow-md rounded-lg">
        {history.length === 0 ? (
          <p className="text-lg text-gray-600">No history available.</p>
        ) : (
          <ul className="list-none space-y-4">
            {history
              .slice()
              .reverse()
              .map((item) => (
                <li
                  key={item._id.$oid}
                  className="sm:p-2 md:p-4 bg-[#f4f7fc] rounded-lg w-full"
                  onClick={() => toggleText(item._id.$oid)}
                >
                  <div className="flex items-center justify-between pr-2 ">
                    <h3 className="p-2 bg-[#c8e6fc] rounded-lg">
                      {languages.find(
                        (lang) => lang.code === item.sourceLanguage
                      )?.name +
                        " > " +
                        languages.find(
                          (lang) => lang.code === item.targetLanguage
                        )?.name}
                    </h3>
                    <span className="text-gray-600 ml-4">
                      <strong>Tarih:</strong> {formatDate(item.date)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border p-2 rounded-lg bg-white">
                        <strong>Orijinal Metin:</strong>
                        <p>
                          {expandedTextId === item._id.$oid
                            ? item.originalText
                            : truncateText(item.originalText, 200)}
                        </p>
                      </div>
                      <div className="border p-2 rounded-lg bg-white">
                        <strong>Çevrilmiş Metin:</strong>
                        <p>
                          {expandedTextId === item._id.$oid
                            ? item.translatedText
                            : truncateText(item.translatedText, 200)}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </>
  );
}
