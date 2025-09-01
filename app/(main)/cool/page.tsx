"use client";
import React ,{useState , useEffect} from 'react'
import axios , {AxiosError} from 'axios'
import { mentors } from '@/app/helpers/proffessors';
import { ApiRes } from '@/app/types/ApiRes';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const Cool = () => {
  const router = useRouter();
  const {data : session , status} = useSession();


  useEffect(() => {
   if(status === "loading") return;
   if(!session || !session.user){
    router.replace("/sign-in");
    return;
   }
    console.log("u" , session.user.name);
    console.log("u" , session.user.email);
  }, [session , status , router])




  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl font-semibold tracking-wide animate-pulse">
          Checking Authentication...
        </p>
      </div>
    );
  }

  if (!session || !session.user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-bold text-white mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-400 text-lg tracking-wide">
            Please login 
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div>
        {session.user?.name}
      </div>

      <div>
        {session.user.usn}
      </div>

      <div>
        {session.user.department}
      </div>

      <div>
       <div>
         <Button onClick={()=> router.replace("/leave/letter")}>
            Generate Letter
        </Button>
       </div>

        <div>
        <Button onClick={()=> router.replace("/lettershistory")}>
            View Letter History
        </Button>
        </div>

      </div>
    </div>
  )
}

export default Cool
