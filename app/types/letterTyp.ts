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
