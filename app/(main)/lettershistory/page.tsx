"use client";
import React, { useState , useEffect} from 'react'
import axios,{AxiosError} from "axios";
import { toast } from 'sonner';
import { ApiRes} from '@/app/types/ApiRes';
import type { LetterHistory } from '@/app/types/ApiRes';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import HistoryCard from '@/components/HistoryCard';

const LetterHistory = () => {
  const {data : session , status} = useSession();
  const router = useRouter();
  const [letterHistory , setLetterHistory] = useState<LetterHistory[]>([]);
  const [isSubmittingLetterHistory , setIsSubmittingLetterHistory] = useState<boolean>(false);
  const [letterError , setLetterError] = useState<string>("");
  const [isDeletingLetter , setIsDeletingLetter] = useState<boolean>(false);
  const [letterDelError , setLetterDelError] = useState<string>("");

  useEffect(() => {
    if(status === "loading") return;
    if(!session || !session.user){
      router.replace("/sign-in");
      return;
    }
  }, [status , session , router])


  useEffect(() => {
    const fetchLetterHistory = async()=>{
      try {
        setIsSubmittingLetterHistory(true);
        setLetterError("");
        const response = await axios.get<ApiRes>("/api/historyletter");
        if(response.data.success && response.data.lettersHist?.length){
          if(response.data.lettersHist.length > 0){
            setLetterHistory(response.data.lettersHist?.reverse() || [])
          }else{
            setLetterError(response.data.message || "You Have zero Leave Letter history");
          }
        } else {
          setLetterError(response.data.message || "Error while accessing the letter history");
        }
      } catch (error) {
        console.error("Error while fetching the letter history" , error);
        const axiosError = error as AxiosError<ApiRes>;
        setLetterError(axiosError.response?.data.message || "Failed to get the Letter History");
      } finally{
        setIsSubmittingLetterHistory(false);
      }
    }

    fetchLetterHistory();
  }, [])

  const deleteLetterHistory = async(id : string)=>{
        try {
          setIsDeletingLetter(true);
          setLetterDelError("");
          if(!id){
            throw new Error("Failed to get the letter id");
          }
          const response = await axios.delete<ApiRes>(`/api/deleteletter/${id}`);
          if(response.data.message){
            toast("Letter history has been deleted" , {
              action : {
                label : "Yeah",
                onClick : ()=> console.log("ok"),
              }
            })
          }else {
            toast("Error while deleting the letter" , {
              action : {
                label : "Yeah",
                onClick : ()=> console.log("ok"),
              }
            })
            setLetterDelError(response.data.message);
          }
        } catch (error) {
          console.log("Error while deleting the letter history");
          const axiosError = error as AxiosError<ApiRes>;
          toast(axiosError.response?.data.message , {
            action : {
              label : "Yeah",
              onClick : ()=> console.log("ok"),
            }
          })

          setLetterDelError(axiosError.response?.data.message || "Error deleting the letter history");
        }finally{
          setIsDeletingLetter(false);
        }
  }


   if (status === "loading") {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-white text-xl font-semibold tracking-wide animate-pulse">
                    Loading...
                </p>
            </div>
        );
    }

    if (!session?.user) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center px-6">
                <div className="text-center max-w-md">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Authentication Required
                    </h2>
                    <p className="text-gray-400 text-lg tracking-wide">
                        Please login to continue
                    </p>
                </div>
            </div>
        );
    }

  return (
    <div>
      <h4>Leave Letter History</h4>

        <div>
          {letterError}
          {!isSubmittingLetterHistory && 
          letterHistory.map((letter)=>(

            <HistoryCard 
            key={letter._idLetter}
            subject={letter.subjectLetter}
            pdfUrl={letter.pdfProxyUrl}
            onDelete={()=> deleteLetterHistory(letter._idLetter)}
            />
          ))}

        </div>

    </div>
  )
}

export default LetterHistory
