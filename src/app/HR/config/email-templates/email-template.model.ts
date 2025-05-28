export class EmailTemplate {
    Id !: number;
    ActionType : string
    subject : string
    fromAddress : string
    salutation : string
    body : string
    regards : string
    footer : string
    smtpServer : string
    smtpPort : string
    smtpUserName : string
    smtpPassword : string
    headerFrame : string
    footerFrame : string
    description : string
    isActive !: boolean;        
    Active : string 
    createdBy :number;
    modifiedBy :number;
    createdDate : Date;
    modifiedDate :Date;
    createdByName : string
    modifiedByName : string
  }