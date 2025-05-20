export class Mail {
            constructor(
               
             public id:	number,
public actionTypeId:	number,
public actionType:	string,
public fromAddress:	string,
public subject:	string,
public salutation:	string,
public body:	string,
public regards:	string,
public footer:	string,
public smtpServer:	string,
public smtpPort:	string,
public smtpUserName:	string,
public smtpPassword:	string,
public headerFrame:	string,
public footerFrame:	string,
public description:	string,
public createdBy:	number,
public createdDate:	string,
public modifiedBy:	number,
public modifiedDate: string,
public isActive:	boolean

            ) { }
       
}
