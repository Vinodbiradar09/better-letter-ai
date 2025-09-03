import React from 'react'
import { Card, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';


interface HistoryCardTyp {
    subject : string,
    pdfUrl : string,
    onDelete?: () => void;
}
const HistoryCard : React.FC<HistoryCardTyp> = ({subject , pdfUrl , onDelete}) => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle> {subject}</CardTitle>
        </CardHeader>
        <CardFooter>
          <Button onClick={()=> window.open(pdfUrl , "_blank")}>View Pdf</Button>
          <Button onClick={onDelete}>Delete Letter</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default HistoryCard
