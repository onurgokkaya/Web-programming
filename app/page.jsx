"use client";
import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
import docsIcon from "@/public/docs.png";
import logoutIcon from "@/public/logout.png";
import copyIcon from "@/public/copy.png";
import historyIcon from "@/public/history.png";
import historyBlueIcon from "@/public/history-blue.png";
import downIcon from "@/public/file-dwnld.png";
import userAddIcon from "@/public/add-user.png";
import usersIcon from "@/public/users.png";
import mammoth from "mammoth";
import { Document, Packer, Paragraph } from "docx";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import MutercimLogo from "@/Components/MutercimLogo";

export const languages = [
  { code: "ar", name: "Arapça" },
  { code: "az", name: "Azerice" },
  { code: "de", name: "Almanca" },
  { code: "en", name: "İngilizce" },
  { code: "fa", name: "Farsça" },
  { code: "fr", name: "Fransızca" },
  { code: "ja", name: "Japonca" },
  { code: "nl", name: "Felemenkçe" },
  { code: "no", name: "Norveççe" },
  { code: "uz", name: "Özbekçe" },
  { code: "so", name: "Somalice" },
  { code: "tr", name: "Türkçe" },
];

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState(languages[3].code);
  const [targetLanguage, setTargetLanguage] = useState(languages[11].code);
  const [history, setHistory] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [showStar, setShowStar] = useState(false);
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [targetDropdownOpen, setTargetDropdownOpen] = useState(false);
  const [expandedTextId, setExpandedTextId] = useState(null);
  const [statu, setStatu] = useState("");
  const [fileType, setFileType] = useState("");
  const [recentSourceLanguages, setRecentSourceLanguages] = useState([
    languages[3].code,
    languages[11].code,
    languages[0].code,
  ]);
  const [recentTargetLanguages, setRecentTargetLanguages] = useState([
    languages[11].code,
    languages[3].code,
    languages[0].code,
  ]);
  const [isPanel, setIsPanel] = useState(false);
  const { data: session, status } = useSession();
  const debounceTimeoutRef = useRef(null);
  const debounceDelay = 2000;

  const fileInputRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (session) {
        setIsAdmin(session.user.isAdmin);
        setStatu(status);
        fetchHistory();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [session, status]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(
        `/api/history/${session.user.provider}/${session.user.email}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history);
      } else {
        console.error("Failed to fetch history");
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const entriesToDisplay = showAll
    ? history.slice().reverse()
    : history.slice(-5).reverse();

  const getLanguageName = (code) => {
    const language = languages.find((lang) => lang.code === code);
    return language ? language.name : "";
  };

  const addStar = async (objectID, isAdd) => {
    console.log(objectID);
    try {
      const res = await fetch("/api/addStar", {
        method: "PATCH",
        headers: {
          "x-api-key": process.env.USER_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mail: session.user.email,
          provider: session.user.provider,
          objectID,
          isAdd,
        }),
      });
      fetchHistory();
      if (!res.ok) {
        console.error("Error from save translation API:", res.statusText);
        return;
      }
    } catch (error) {
      console.error("Error in addStar:", error);
    }
  };

  const handleTranslate = async (input) => {
    if (input.trim().length === 0) {
      setTranslatedText("");
      return;
    }

    const translatePart = async (textPart) => {
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: {
            "x-api-key": process.env.USER_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: textPart,
            sourceLanguage,
            targetLanguage,
            sourceLanguageName: getLanguageName(sourceLanguage),
            targetLanguageName: getLanguageName(targetLanguage),
            mail: session.user.email,
            provider: session.user.provider,
          }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          toast.error(`${errorData.error}`, {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          throw new Error(res.statusText);
        }
        const data = await res.json();
        return data.translatedText;
      } catch (error) {
        console.error("Translating error: ", error);
      }
      return "translation failed";
    };

    const translateInParts = async (input) => {
      let fullTranslation = "";
      let remainingText = input;

      while (remainingText.length > 4096) {
        const cutoffIndex = remainingText.lastIndexOf(".", 4096);
        const splitIndex = cutoffIndex !== -1 ? cutoffIndex + 1 : 4096;
        const textPart = remainingText.slice(0, splitIndex);
        fullTranslation += await translatePart(textPart);
        remainingText = remainingText.slice(splitIndex).trim();
      }

      if (remainingText.length > 0) {
        fullTranslation += await translatePart(remainingText);
      }
      return fullTranslation;
    };

    setTranslatedText("Translating...");
    const finalTranslation = await translateInParts(input);
    setTranslatedText(finalTranslation);
  };

  const handleChange = (input) => {
    setText(input);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      handleTranslate(input);
    }, debounceDelay);
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileType = file.name.split(".").pop().toLowerCase();
      setFileType(fileType);
      const reader = new FileReader();

      reader.onload = (e) => {
        if (fileType === "txt") {
          handleChange(e.target.result);
        } else if (fileType === "docx" || fileType === "odt") {
          mammoth
            .extractRawText({ arrayBuffer: e.target.result })
            .then((result) => {
              handleChange(result.value);
            })
            .catch((error) => {
              console.error("Error converting DOCX/ODT file:", error);
            });
        } else {
          console.error("Unsupported file type");
        }
      };
      if (fileType === "txt") {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    }
  };
  const downloadFile = () => {
    if (!translatedText) return;

    let blob;
    if (!fileType || fileType === "txt") {
      blob = new Blob([translatedText], { type: "text/plain" });
      saveAs(blob, "translated_text.txt");
    } else {
      switch (fileType) {
        case "docx":
          const doc = new Document({
            sections: [
              {
                children: [new Paragraph(translatedText)],
              },
            ],
          });

          Packer.toBlob(doc).then((blob) => {
            saveAs(blob, "translated_text.docx");
          });
          break;

        case "odt":
          const zip = new JSZip();
          zip.file(
            "content.xml",
            `<office:text>${translatedText}</office:text>`
          );
          zip.generateAsync({ type: "blob" }).then((blob) => {
            saveAs(blob, "translated_text.odt");
          });
          break;

        default:
          console.error("Unsupported file type");
      }
    }
  };

  const copyToClipboard = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(translatedText).catch((err) => {
        console.error("Kopyalama işlemi başarısız oldu:", err);
      });
    }
  };
  const switchLanguages = () => {
    const temp = sourceLanguage;
    sourceLanguageChange(targetLanguage);
    targetLanguageChange(temp);
  };
  const handleHistoryButton = () => {
    setShowHistory(true);
    setShowStar(false);
  };
  const handleStarButton = () => {
    setShowHistory(false);
    setShowStar(true);
  };

  const sourceLanguageChange = (langCode) => {
    setSourceLanguage(langCode);
    setRecentSourceLanguages(() => {
      const updatedLanguages = recentSourceLanguages.filter(
        (lang) => lang !== langCode
      );
      updatedLanguages.unshift(langCode);
      if (updatedLanguages.length > 3) updatedLanguages.pop();

      return updatedLanguages;
    });
  };
  const targetLanguageChange = (langCode) => {
    setTargetLanguage(langCode);
    setRecentTargetLanguages(() => {
      const updatedLanguages = recentTargetLanguages.filter(
        (lang) => lang !== langCode
      );
      updatedLanguages.unshift(langCode);
      if (updatedLanguages.length > 3) updatedLanguages.pop();

      return updatedLanguages;
    });
  };
  const truncateText = (text, limit) => {
    return text.length > limit ? text.slice(0, limit) + "..." : text;
  };
  const toggleText = (id) => {
    setExpandedTextId(expandedTextId === id ? null : id);
  };

  const togglePanel = () => {
    setIsPanel(!isPanel);
  };

  const items = [
    {
      type: "link",
      href: "auth/register",
      icon: userAddIcon,
      text: "Kullanıcı Ekle",
      alt: "User-add Icon",
      role: "admin",
    },
    {
      type: "link",
      href: "users",
      icon: usersIcon,
      text: "Kullanıcılar",
      alt: "User-del Icon",
      role: "admin",
    },
    {
      type: "button",
      key: "fileUpload",
      onClick: () => fileInputRef.current.click(),
      icon: docsIcon,
      text: "Dosya Yükle",
      alt: "Document Icon",
    },
    {
      type: "button",
      key: "signOut",
      onClick: () => signOut(),
      icon: logoutIcon,
      text: "Çıkış Yap",
      alt: "Logout Icon",
    },
  ];
  const filteredItems = items.filter(
    (item) => item.role !== "admin" || isAdmin
  );

  const actionItems = [
    {
      key: "copy",
      className:
        "h-8 w-8 absolute sm:bottom-[-11%] md:bottom-[-7%] sm:left-[79%] md:left-[82%] lg:left-[88%] p-1 rounded-lg hover:bg-gray-200 group relative",
      onClick: copyToClipboard,
      icon: copyIcon,
      text: "Kopyala",
      alt: "Copy Icon",
    },
    {
      key: "download",
      className:
        "h-8 w-8 absolute bottom-[3%] sm:left-[88%] md:left-[90%] lg:left-[93%] p-1 rounded-lg hover:bg-gray-200 group relative",
      onClick: downloadFile,
      icon: downIcon,
      text: "İndir",
      alt: "Download Icon",
    },
  ];

  return (
    <div className="px-12 py-4 w-full h-full">
      {statu === "loading" ? (
        <p className="text-8xl h-screen flex justify-center items-center">◌</p>
      ) : (
        <>
          <Toaster />
          <header className="flex justify-between items-center p-2">
            <MutercimLogo />
            <div className="flex space-x-4 justify-end">
              <button
                className="md:hidden p-2-10 w-24 rounded-lg text-lg"
                onClick={togglePanel}
              >
                ☰
              </button>
              <div
                className={`absolute z-20 top-0 right-0 md:hidden justify-start items-center flex-col w-full h-screen py-[8%] bg-[#d3e3fd] backdrop-blur-sm bg-opacity-80 ${
                  isPanel ? "flex" : "hidden"
                }`}
              >
                <div className="p-8 mb-8 h-10 w-full rounded-lg text-lg flex justify-end items-center">
                  <button
                    onClick={togglePanel}
                    className="p-4 bg-blue-200 rounded-2xl font-bold"
                  >
                    X
                  </button>
                </div>
                {filteredItems.map((item, index) => {
                  if (item.type === "link") {
                    return (
                      <Link
                        key={index}
                        target="_blank"
                        className="group relative flex justify-center items-center p-4 md:h-10 md:w-24 rounded-lg text-sm"
                        href={item.href}
                      >
                        {item.text}
                      </Link>
                    );
                  } else if (item.type === "button") {
                    return (
                      <button
                        key={item.key}
                        className="flex relative justify-center items-center md:h-10 md:w-24 p-4 text-sm rounded-lg group"
                        onClick={item.onClick}
                      >
                        {item.text}
                      </button>
                    );
                  }
                })}
              </div>
              <div
                className="justify-center sm:space-y-3 md:space-x-4 sm:items-end sm:absolute sm:z-10 sm:top-16 sm:right-15 md:static sm:flex-col md:flex-row 
                   sm:hidden md:flex"
              >
                {filteredItems.map((item, index) => {
                  if (item.type === "link") {
                    return (
                      <Link
                        key={index}
                        target="_blank"
                        className="group relative flex justify-center items-center p-2 md:h-10 md:w-24 rounded-lg text-sm hover:bg-[#f4f7fc]"
                        href={item.href}
                      >
                        <Image
                          className="p-1 rounded-md flex justify-center items-center"
                          src={item.icon}
                          width={32}
                          height={32}
                          alt={item.alt}
                        />
                        <span className="absolute bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                          {item.text}
                        </span>
                      </Link>
                    );
                  } else if (item.type === "button") {
                    return (
                      <button
                        key={item.key}
                        className="flex relative justify-center items-center md:h-10 md:w-24 p-2 hover:bg-[#f4f7fc] text-sm rounded-lg group"
                        onClick={item.onClick}
                      >
                        <Image
                          className="p-1 rounded-md flex items-center justify-center"
                          src={item.icon}
                          width={32}
                          height={32}
                          alt={item.alt}
                        />
                        <span className="absolute bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                          {item.text}
                        </span>
                      </button>
                    );
                  }
                })}

                <input
                  id="fileInput"
                  ref={fileInputRef}
                  type="file"
                  accept=".txt, .docx, .odt"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </header>
          <section className="relative flex sm:flex-col md:flex-row mt-4 w-full h-80">
            <button
              className="h-10 w-12 z-10 absolute sm:hidden md:flex md:bottom-[20%] md:left-[47%] lg:left-[48.5%] 2xl:left-[49%]
              flex items-center justify-center p-2 bg-[#d3e3fd] text-gray-900 rounded-lg hover:bg-[#c8e6fc]"
              onClick={switchLanguages}
            >
              ⇆
            </button>
            <div className="relative flex flex-col sm:w-full md:w-1/2 h-full">
              <div className="flex justify-start space-x-2 items-center m-4 sm:text-xs md:text-base">
                {recentSourceLanguages.map((code) => (
                  <button
                    key={code}
                    className={`h-10 w-24 p-2 rounded-lg hover:bg-[#f4f7fc] ${
                      code === sourceLanguage ? "bg-[#c8e6fc]" : ""
                    }`}
                    onClick={() => sourceLanguageChange(code)}
                  >
                    {languages.find((l) => l.code === code)?.name}
                  </button>
                ))}
                <button
                  className={`btn p-2 rounded-md ${
                    sourceDropdownOpen ? "bg-[#d3e3fd]" : "hover:bg-[#d3e3fd]"
                  }`}
                  onClick={() => setSourceDropdownOpen(!sourceDropdownOpen)}
                >
                  {sourceDropdownOpen ? "︿" : "﹀"}
                </button>
                <ul
                  className={`absolute z-10 bg-white grid grid-cols-2 gap-1 top-[20%] left-[40%] p-1 mt-2 w-52 rounded shadow-lg ${
                    sourceDropdownOpen ? "block" : "hidden"
                  }`}
                >
                  {languages.map((lang) => (
                    <li
                      className="hover:bg-[#f4f7fc] p-1 w-25 text-gray-800 rounded-md flex flex-start"
                      key={lang.code}
                    >
                      <button
                        className="w-full text-left"
                        onClick={() => {
                          sourceLanguageChange(lang.code);
                          setSourceDropdownOpen(!sourceDropdownOpen);
                        }}
                      >
                        {lang.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <textarea
                className="w-full h-full relative pt-2 px-8 sm:mb-4 md:mb-0 pb-8 border-t rounded-lg resize-none outline-none scrollbar-hide"
                rows="8"
                value={text}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Enter text here..."
              ></textarea>
            </div>

            <div className="relative flex flex-col sm:w-full sm:pd-8 md:p-0 md:w-1/2 md:h-full bg-[#f4f7fc]">
              <div className="flex justify-start space-x-2 items-center m-4 sm:text-xs md:text-base">
                {recentTargetLanguages.map((code) => (
                  <button
                    key={code}
                    className={`h-10 w-24 p-2 rounded-lg hover:bg-gray-200 ${
                      code === targetLanguage ? "bg-[#c8e6fc]" : ""
                    }`}
                    onClick={() => targetLanguageChange(code)}
                  >
                    {languages.find((l) => l.code === code)?.name}
                  </button>
                ))}
                <button
                  className={`btn p-2 rounded-md ${
                    targetDropdownOpen ? "bg-[#d3e3fd]" : "hover:bg-[#d3e3fd]"
                  }`}
                  onClick={() => setTargetDropdownOpen(!targetDropdownOpen)}
                >
                  {targetDropdownOpen ? "︿" : "﹀"}
                </button>
                <ul
                  className={`absolute z-10 bg-white grid grid-cols-2 gap-1 top-[20%] left-[40%] p-1 mt-2 w-52 rounded shadow-lg ${
                    targetDropdownOpen ? "block" : "hidden"
                  }`}
                >
                  {languages.map((lang) => (
                    <li
                      className="hover:bg-[#f4f7fc] p-1 w-25 text-gray-800 rounded-md flex flex-start"
                      key={lang.code}
                    >
                      <button
                        className="w-full text-left"
                        onClick={() => {
                          targetLanguageChange(lang.code);
                          setTargetDropdownOpen(!targetDropdownOpen);
                        }}
                      >
                        {lang.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <textarea
                readOnly
                value={translatedText}
                className="w-full h-full relative bg-[#f4f7fc] pt-2 px-8 pb-8 border-t rounded-lg resize-none outline-none overflow-y-scroll"
              ></textarea>
              {actionItems.map(
                ({ key, className, onClick, icon, text, alt }) => (
                  <button key={key} className={className} onClick={onClick}>
                    <Image
                      className="p-1 rounded-md"
                      src={icon}
                      width={32}
                      height={32}
                      alt={alt}
                    />
                    <span className="absolute bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      {text}
                    </span>
                  </button>
                )
              )}
            </div>
          </section>
          <footer className="sm:absolute md:static top-[90%]">
            <div className="ml-6 flex mt-6">
              <button
                className={`p-1 flex items-center justify-center rounded-md text-s ${
                  showHistory
                    ? "text-blue-500 border-b-2 border-blue-700"
                    : "hover:text-gray-500"
                }`}
                onClick={handleHistoryButton}
              >
                <Image
                  className="p-1 flex items-center justify-center rounded-md"
                  src={showHistory ? historyBlueIcon : historyIcon}
                  width={24}
                  height={24}
                  alt="History Icon"
                />
                Geçmiş
              </button>
              <button
                className={`ml-2 p-1 flex items-center justify-center rounded-md text-xl ${
                  showStar
                    ? "text-blue-500 border-b-2 border-blue-700"
                    : "hover:text-gray-500"
                }`}
                onClick={handleStarButton}
              >
                ★<span className="text-base">&nbsp;Favoriler</span>
              </button>
            </div>

            <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 md:grid-cols-3 sm:text-xs md:text-base sm:pt-4 sm:pr-4 md:p-8">
              {showHistory &&
                entriesToDisplay.map((entry) => (
                  <div
                    key={entry._id}
                    className="sm:p-2 md:p-4 bg-[#f4f7fc] rounded-lg h-fit w-full"
                    onClick={() => toggleText(entry._id)}
                  >
                    <div className="flex md:pr-2 sm:justify-start md:justify-between items-center">
                      <h3 className="w-fit p-2 bg-[#c8e6fc] rounded-lg text-start">
                        {languages.find(
                          (lang) => lang.code === entry.sourceLanguage
                        )?.name +
                          ">" +
                          languages.find(
                            (lang) => lang.code === entry.targetLanguage
                          )?.name}
                      </h3>
                      <button
                        className="flex items-center justify-center rounded-md px-1 text-xl hover:text-gray-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          addStar(entry._id, !entry.isStar);
                        }}
                      >
                        {entry.isStar ? "★" : "☆"}
                      </button>
                    </div>
                    <br />
                    <p className="font-medium">
                      {expandedTextId === entry._id
                        ? entry.originalText
                        : truncateText(entry.originalText, 32)}
                    </p>
                    <br />
                    <p>
                      {expandedTextId === entry._id
                        ? entry.translatedText
                        : truncateText(entry.translatedText, 32)}
                    </p>
                  </div>
                ))}
              {showHistory && !showAll && history.length > 5 && (
                <button
                  onClick={() => setShowAll(true)}
                  className="flex items-center justify-center m-12 p-4 bg-[#f4f7fc] rounded-lg hover:bg-[#c8e6fc]"
                >
                  Hepsini Göster
                </button>
              )}
              {showStar &&
                history
                  .filter((entry) => entry.isStar === true)
                  .reverse()
                  .map((entry) => (
                    <div
                      key={entry._id.$oid}
                      className="sm:p-2 md:p-4 bg-[#f4f7fc] rounded-lg h-fit w-full"
                      onClick={() => toggleText(entry._id)}
                    >
                      <div className="flex pr-2 sm:justify-start md:justify-between items-center">
                        <h3 className="w-fit p-2 bg-[#c8e6fc] rounded-lg">
                          {languages.find(
                            (lang) => lang.code === entry.sourceLanguage
                          )?.name +
                            ">" +
                            languages.find(
                              (lang) => lang.code === entry.targetLanguage
                            )?.name}
                        </h3>
                        <button
                          className="flex items-center justify-center rounded-md px-1 text-xl hover:text-gray-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            addStar(entry._id, !entry.isStar);
                          }}
                        >
                          ★
                        </button>
                      </div>
                      <br />

                      <p className="font-medium">
                        {expandedTextId === entry._id
                          ? entry.originalText
                          : truncateText(entry.originalText, 32)}
                      </p>
                      <br />
                      <p>
                        {expandedTextId === entry._id
                          ? entry.translatedText
                          : truncateText(entry.translatedText, 32)}
                      </p>
                    </div>
                  ))}
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
