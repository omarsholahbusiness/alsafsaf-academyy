"use client";

import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { useLanguage } from "@/components/providers/rtl-provider";

export const UserButton = () => {
  const { data: session } = useSession();
  const { locale } = useLanguage();

  if (!session?.user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={session.user.image || ""} />
          <AvatarFallback>
            {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => signOut()}
          className="text-red-600 cursor-pointer"
        >
          <LogOut className="h-4 w-4 rtl:mr-2 ltr:ml-2" />
          {locale === "ar" ? "تسجيل الخروج" : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 