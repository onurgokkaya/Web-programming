"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import MutercimLogo from "@/Components/MutercimLogo";
import adminIcon from "@/public/admin.png";
import addAdminIcon from "@/public/add-admin.png";
import historyIcon from "@/public/history.png";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/users", {
          method: "GET",
          headers: {
            "x-api-key": process.env.ADMIN_KEY,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const fetchedUsers = await response.json();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [updateTrigger]);

  const handleDeleteUser = async (mail, isActive) => {
    try {
      const response = await fetch(`/api/changeActive`, {
        method: "PATCH",
        headers: {
          "x-api-key": process.env.ADMIN_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mail,
          isActive,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      setUpdateTrigger((prev) => !prev);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };
  const addAdmin = async (mail, isAdmin) => {
    try {
      const response = await fetch(`/api/addAdmin`, {
        method: "PATCH",
        headers: {
          "x-api-key": process.env.ADMIN_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mail,
          isAdmin,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      setUpdateTrigger((prev) => !prev);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="flex flex-col items-center sm:p-4 lg:p-8 bg-gray-f4f7fc h-screen w-full">
      <MutercimLogo width={true} />
      <h2 className="text-xl font-bold pt-4 mb-2">Kullanıcı Listesi</h2>
      <div className="md:w-4/5 lg:w-3/5 bg-white shadow-md rounded-lg p-4">
        {loading ? (
          <div className="flex justify-center items-center h-1/6 w-full">
            <span className="text-gray-500 text-4xl">◌</span>
          </div>
        ) : users.length === 0 ? (
          <p className="text-gray-500 text-center">Kullanıcı bulunamadı.</p>
        ) : (
          <ul className="space-y-4 sm:text-xs md:text-base">
            {users.map((user) => {
              const url = `/history/${encodeURIComponent(
                user.mail
              )}`;

              return (
                <li
                  key={user.mail}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded-md shadow-sm"
                >
                  <span className="text-gray-800">{user.mail}</span>
                  <div className="relative flex space-x-2">
                    <div className="group relative">
                      <Link
                        href={url}
                        className="relative flex justify-center items-center bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-600 sm:w-18 sm:h-8 md:w-24 md:h-12"
                      >
                        <Image
                          className="p-4 rounded-md sm:hidden md:flex md:h-fit md:w-fit"
                          src={historyIcon}
                          alt="History Icon"
                        />
                        <span className="absolute bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                          Geçmiş Çeviriler
                        </span>
                      </Link>
                    </div>
                    <div className="group relative">
                      <button
                        className="relative flex justify-center items-center bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-600 sm:w-18 sm:h-8 md:w-24 md:h-12"
                        onClick={() =>
                          handleDeleteUser(user.mail, !user.isActive)
                        }
                      >
                        <div className="md:hidden">
                          {user.isActive ? "Kullanıcıyı sil" : "Aktif yap"}
                        </div>
                        <div className="sm:hidden md:flex">
                          {user.isActive ? "✓" : "☓"}
                        </div>
                        <span className="absolute bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                          {user.isActive
                            ? "Kullanıcıyı sil"
                            : "Kullanıcıyı aktif yap."}
                        </span>
                      </button>
                    </div>
                    <div className="group relative sm:text-2xs">
                      <button
                        className="relative flex justify-center items-center bg-orange-400 text-white px-4 py-2 rounded-lg hover:bg-orange-600 sm:w-18 sm:h-8 md:w-24 md:h-12"
                        onClick={() => addAdmin(user.mail, !user.isAdmin)}
                      >
                        <div className="md:hidden">
                          {user.isAdmin ? "Yetkiyi Kaldır" : "Yetkilendir"}
                        </div>
                        <Image
                          className="p-4 rounded-md sm:hidden md:flex md:h-fit md:w-fit"
                          src={user.isAdmin ? adminIcon : addAdminIcon}
                          alt={user.isAdmin ? "Admin Icon" : "Add Admin Icon"}
                        />
                        <span className="absolute bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                          {user.isAdmin
                            ? "Admin yetkisini kaldır"
                            : "Admin yetkisi ver"}
                        </span>
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
