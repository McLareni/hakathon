"use client";

import { BotMessageSquare, Bell } from "lucide-react";

export const Header = () => {
  return (
    <section className="px-5 pb-0 pt-5 bg-[#F5F5F5]">
      <div className="mb-3 flex flex-col items-center justify-between">
        <div className="flex w-full items-center justify-between ">
          <div className="bg-red-600 rounded-lg h-8 w-8 flex items-center justify-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/c/c9/Coat_of_arms_of_Poland.svg"
              alt="Godlo"
              className="h-5 w-5 invert brightness-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <BotMessageSquare className="w-8 h-8" />
            <Bell className="w-8 h-8" />
          </div>
        </div>
      </div>

    </section>
  );
};
