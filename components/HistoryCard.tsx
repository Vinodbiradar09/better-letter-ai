import React from 'react'


interface HistoryCardTyp {
    subject : string,
    pdfUrl : string,
    onDelete?: () => void;
}
const HistoryCard : React.FC<HistoryCardTyp> = ({subject , pdfUrl , onDelete}) => {
  return (
    <div>
      
    </div>
  )
}

export default HistoryCard
