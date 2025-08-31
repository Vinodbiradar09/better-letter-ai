export interface LetterTyp {
    to : {
        name : string,
        email : string,
        info : string,
    },
    fromDate : Date,
    toDate : Date,
    totalDays : number,
    reason : string,
}

export interface SearchHistoryTyp {
    from : string,
    emailSent : boolean,
    subject?: string | { $regex: string; $options: string };
}