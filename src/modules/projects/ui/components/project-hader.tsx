import Link from "next/link";
import Image from "next/image";
import {useTheme} from "next-themes";
import {useSuspenseQuery} from "@tanstack/react-query";

import {
    ChevronDownIcon,
    ChevronLeftIcon,
    EditIcon,
    HomeIcon,
    SunMoonIcon,
} from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";


interface Props{
    projectId: string;
}

export const ProjectHeader = ({projectId}:Props) =>{
    const trpc = useTRPC();
    const {data: project} = useSuspenseQuery(trpc.projects.getOne.queryOptions({id: projectId}));

    const {theme, setTheme} = useTheme();

   return (
    <header className="p-2 flex justify-between items-center border-b">
        <DropdownMenu   >
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm"
                className="focus-visible:ring-0 hover:bg-transparent hover:opacity-75 transition-opacity pl-2!">
                    <Image
                    src='/logo.svg'
                    alt="Loveable Logo"
                    width={18}
                    height={18}
                    />
                    <span className="text-sm font-medium">
                        {project.name}
                    </span>
                    <ChevronDownIcon className="w-4 h-4 ml-2"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="start">
                <DropdownMenuItem asChild>
                    <Link href={'/'}>
                        <HomeIcon className="w-4 h-4 mr-2"/>
                        <span>Home</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="gap-2">
                        <SunMoonIcon className="size-4 text-muted-foreground"/>
                        <span>Theme</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            <DropdownMenuRadioGroup value={theme} onValueChange={(value)=>setTheme(value as "light" | "dark" | "system")}>
                               <DropdownMenuRadioItem value="light">
                                <span className="text-sm">Light</span>
                               </DropdownMenuRadioItem>
                               <DropdownMenuRadioItem value="dark">
                                <span className="text-sm">Dark</span>
                               </DropdownMenuRadioItem>
                               <DropdownMenuRadioItem value="system">
                                <span className="text-sm">System</span>
                               </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
            </DropdownMenuContent>
        </DropdownMenu>
    </header>
   )
}