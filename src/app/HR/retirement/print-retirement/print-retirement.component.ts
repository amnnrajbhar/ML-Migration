import { Component, Input, OnInit } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { PERMISSIONS } from '../../../shared/permissions';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
//import { Util } from '../Services/util.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
declare var $: any;
declare var toastr: any;
// import * as pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
// import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Retirement } from '../retirement-list/retirement.model';
import { SafeHtmlPipe } from '../../Services/safe-html.pipe';
import {Pipe, PipeTransform} from "@angular/core";
import { Util } from '../../Services/util.service';



@Component({
  selector: 'app-print-retirement',
  templateUrl: './print-retirement.component.html',
  styleUrls: ['./print-retirement.component.css'],
  providers: [Util]
})
export class PrintRetirementComponent implements OnInit {
  retirementId: any;
  employeeId: any;
  currentUser!: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  isLoading: boolean = false;
  employeeDetails: any = {};
  details: any = {};
  signatory: any = {};
  isEdit: boolean = false;
  removeSignature = false;
  letterType: any;
  canPrint = false;
  canEmail = false;
  canDownload = false;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private http: HttpClient, private location: Location, private util: Util) {
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
 }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.employeeId = this.route.snapshot.paramMap.get('id')!;   
      this.canPrint = this.util.hasPermission(PERMISSIONS.HR_PRINT_LETTERS);
      this.canEmail = this.util.hasPermission(PERMISSIONS.HR_EMAIL_LETTERS);
      this.canDownload = this.util.hasPermission(PERMISSIONS.HR_DOWNLOAD_LETTERS);
      this.getbase64image();
      this.getLetter();
    }
  }

  isEmailValid:boolean=false;
  validateEmail(email:any)
  {
    const expression: RegExp = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;

    this.isEmailValid = expression.test(email);
    
    console.log('e-mail is ' + (this.isEmailValid  ? 'correct' : 'incorrect'));
  }

  LoadEmployeeDetails() {
    this.isLoading = true;
    
    this.httpService.getById(APIURLS.HR_EMPLOYEE_DETAILS_API, this.employeeId).then((data: any) => {
      if (data) {
        this.employeeDetails = data;   
        this.employeeDetails.fullName = this.employeeDetails.firstName + ' ' + this.employeeDetails.middleName + ' ' + this.employeeDetails.lastName;    
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;      
    });
  }

  getLetter() {
    this.isLoading = true;
    
    this.httpService.HRget(APIURLS.RETIREMENT_GET_RETIREMENT_LETTER+"/"+this.employeeId).then((data: any) => {
      if (data) {
        this.details = data;        
        this.LoadEmployeeDetails();
        this.GetSignatoryDetails();
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;      
    });
  }

  GetSignatoryDetails() {
    if (this.details) {   
      this.http.get('../../..' + this.details.imageUrl, { responseType: 'blob' })
        .subscribe(blob => {
          const reader = new FileReader();
          const binaryString = reader.readAsDataURL(blob);
          reader.onload = (event: any) => {
            //this.signatory.image = event.target.result;
            this.details.content = this.details.content.replace("{SIGNATORY_IMAGE}",event.target.result);
            setTimeout(()=>{this.saveLetter();}, 100);
          }
        });
    }
  }
  
  // getPrintTemplates(){
  //   //console.log(event.target.value);
  //   this.httpService.HRget(APIURLS.RETIREMENT_GET_PRINT_TEMPLATES).then((data: any) => {
  //     if (data.length > 0) {
  //       this.printTemplates = data.sort((a:any, b:any) => { if (a.templateName > b.templateName) return 1; if (a.templateName < b.templateName) return -1; return 0; });
  //     }
  //   }).catch((error)=> {
  //     this.printTemplates = [];
  //   });
  // }
  
  print() {
    //Copy the element you want to print to the print-me div.
    //$("#printarea").clone().appendTo("#print-me");
    //Apply some styles to hide everything else while printing.
    $("body").addClass("printing");
    //Print the window.
    window.print();
    //Restore the styles.
    $("body").removeClass("printing");
    //Clear up the div.
    //$("#print-me").empty();
  }

  image!: string
  getbase64image() {
    this.http.get('../../../assets/dist/img/micrologo.png', { responseType: 'blob' })
      .subscribe(blob => {
        const reader = new FileReader();
        const binaryString = reader.readAsDataURL(blob);
        reader.onload = (event: any) => {
          console.log('Image in Base64: ', event.target.result);
          this.image = event.target.result;
        };

      });
  }

  setFormatedDateTime(date: any) {
    let dt = new Date(date);
    let formateddate = ("00" + dt.getDate()).slice(-2) + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
      dt.getFullYear() + ' ' +
      ("00" + dt.getHours()).slice(-2) + ":" +
      ("00" + dt.getMinutes()).slice(-2) + ":" +
      ("00" + dt.getSeconds()).slice(-2);
    return formateddate;
  }

  setDateFormate(date: any): string {
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear();
  }

  download() {
   // this.createPDF(false).open();
    this.saveLetterActivity("Downloaded");
  }

  createPDF(forPrinting: boolean) {
    //var printContents = document.getElementById('pdfcontent').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED";//+','+this.locationname;
    var address = "REGD. & CORPORATE OFFICE: # 31, RACE COURSE ROAD, BENGALURU 560 001, KARNATAKA, INDIA";
    var contactInfo = "Tel. : +91- 80-2237 0451- 57 Fax : +91-80-2237 0463 CIN: U24232KA1973PLC002d01 Website: www.microlabsltd.com Email : info@microlabs.in";
    var logo = this.image;
    var pdfContent = $('#pdfcontent').clone();
    var printContents = $(pdfContent).html();

    var header: any = 
    {
      alignment: 'center',
      stack: [
        { image: logo, width: 80, height: 60 },
        { text: OrganisationName, bold: true, fontSize: 16 },
        { text: address, fontSize: 9 },
        { text: contactInfo, fontSize: 8 },
      ],
      width: '*',
      margin: [0, 0, 0, 15],
      height: 140
    };

    if(forPrinting == true){
      header = {};

      if(this.removeSignature == true)
        $(pdfContent).find(".imgSign").replaceWith('<br/><br/><br/>');
      
      printContents = $(pdfContent).html();
      printContents = "<div style='margin-top:120px;'>&nbsp;</div>"+printContents; 
      //pageMarginsConfig =  [40, 40, 40, 50];
    }

  //   var htmnikhitml = htmlToPdfmake(`<html>
  // <head>
  // </head>
  // <body>
  // ${printContents}
  // <div>     
  // </div>
  // </body>  
  // </html>`, {
  //     tableAutoSize: true,
  //     headerRows: 1,
  //     dontBreakRows: true,
  //     keepWithHeaderRows: true,
  //     defaultStyles: {      
  //       td: {         
  //        border: undefined
  //        },
  //        img: undefined,
  //        p: undefined       
  //      }
  //   });
    var docDefinition = {
      info: {
        title: 'Retirement Letter',
      },
      content: [
        header,
       // htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 10,
        // fontStyle: 'normal',
        // font: 'Times',
        p: { margin: [10, 5, 10, 10], alignment: 'justify' },
        img: { margin: [0, 0, 0, 0] },
        b: { margin: [0, 0, 0, 0] },
        bold: false,
        table: {
          width: '*',
          margin: [10,10,10,10],
          border: [true, true, true, true]
        },
        th: { bold: true, fillColor: '#8B0000' },
        td: {         
          border: [true, true, true, true]
        }
      },
      stack: [{
        unbreakable: true,
      }],
      styles: {
        "pull-right": {
          textAlign: "right"
        },
        "html-div":{
          unbreakable: true
        },
        "html-table":{
          unbreakable: true
        },
        "html-td":{
          border: [true, true, true, true],
          margin: [0, 0, 0, 0], 
        },
        "html-th":{
          border: [true, true, true, true],
          margin: [0, 0, 0, 0], 
        },
        "html-p":{
          unbreakable: true,
          margin: [0, 5, 0, 5], 
          alignment: 'justify'
        },
        "html-li":{
          margin: [0, 5, 0, 10], 
          alignment: 'justify'
        },
        tableNoBorders: {
          border: [false, false, false, false],
          margin: [0, 0, 0, 0], 
        }   
      },
      pageBreak: "after",
      pageSize: 'A4',
      pageMargins: [40, 20, 40, 40],
      pageOrientation: 'portrait',      
      footer: function (currentPage, pageCount) {        
        return {    
          margin: [40, 5, 40, 5]
        }
      }
    };
    
//    return pdfMake.createPdf(docDefinition);
  }

  sendEmail() {
    this.validateEmail(this.employeeDetails.personalEmailId);
    if (this.isEmailValid == false)
    {
      toastr.error("Please enter valid email Id.");
      return;
    }
    if(this.employeeDetails.personalEmailId == undefined || this.employeeDetails.personalEmailId ==''){
      toastr.error("Please enter email Id.");
      return;
    }
    if (confirm("Are you sure you want to send email?")) {
      var request: any = {};
      request.retirementId = this.employeeDetails.retirementId;
      request.submittedById = this.currentUser.uid;
      request.submittedByName = this.currentUser.fullName;
      request.emailId = this.employeeDetails.personalEmailId;
      //request.letterType = this.printTemplates.find(x=>x.printTemplateId==this.selectedTemplateId).templateType;

      this.isLoading = true;
      // this.createPDF(false).getBase64((encodedString) => {
      //   if (encodedString) {
      //     request.attachment = encodedString;
      //     toastr.info("Sending email...");
      //     this.isLoading = true;
      //     this.httpService.HRpost(APIURLS.RETIREMENT_DETAILS_SEND_EMAIL, request).then((data: any) => {
      //       if (data == 200 || data.success) {
      //         toastr.success("Successfully emailed the letter.");
      //         this.saveLetterActivity("Emailed");
      //       } else if (!data.success) {
      //         toastr.error(data.message);
      //       } else
      //       toastr.error("Error occurred.");
      //       this.isLoading = false;
      //     }
      //     ).catch((error)=> {
      //       toastr.error(error);
      //       this.isLoading = false;
      //     });
      //   }
      // });
    }
  }

  goBack() {
    this.location.back();
  }

print1(): void {

 // this.createPDF(true).print(); 
  this.saveLetterActivity("Printed");
  return;

  // this.printElement(document.getElementById("print-section"));
    let printContents, popupWin;
    printContents = document.getElementById('pdfcontent').innerHTML;
    
    if(this.removeSignature == true)
      printContents = printContents.replace("imgSign", "imgSign-hidden");

    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
         
         <link rel="stylesheet" type="text/css" href="assets/custom/print.css" />
          <link rel="stylesheet" type="text/css" href="assets/bootstrap/css/bootstrap.min.css" />
        </head>
        <body onload="window.print();window.close()">
        <table class="report-container">
          <thead class="report-header">
            <tr>
              <th class="report-header-cell">
                <div class="header-info">
                 
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="report-content">
            <tr>
              <td class="report-content-cell">
                <div class="main">
                ${printContents}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        </body>
      </html>`
    );
    popupWin.document.close();
  }
  
  saveLetter(){
    // this.createPDF(false).getBase64((encodedString) => {
    //   if (encodedString) {
    //     var request: any = {};
    //     request.attachment = encodedString;      
    //     request.objectId = this.employeeId;
    //     request.employeeId = this.employeeDetails.employeeId;
    //     request.objectType = "Employee";
    //     request.letterType = "Retirement Letter";
    //     request.submittedById = this.currentUser.uid;
    //     request.submittedByName = this.currentUser.fullName;
    //     this.util.saveLetter(request);
    //   }
    // });
  }
  
  saveLetterActivity(activity: string){
    console.log("saving letter..."+ activity);
    var request: any = {}; 
    request.employeeId = this.employeeDetails.employeeId;
    request.objectId = this.employeeId;
    request.objectType = "Employee";
    request.letterType = "Retirement Letter";
    request.activity = activity;
    request.activityById = this.currentUser.uid;
    this.util.saveLetterActivity(request);
  }

}


