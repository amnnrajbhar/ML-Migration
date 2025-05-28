import { Component, Input, OnInit } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
//import { Util } from '../Services/util.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { NgForm } from '@angular/forms';
declare var $: any;
declare var toastr: any;
// import * as pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
// import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Recall } from '../recall/recall.model';
import { SafeHtmlPipe } from '../../Services/safe-html.pipe';
import {Pipe, PipeTransform} from "@angular/core";

@Component({
  selector: 'app-print-recall',
  templateUrl: './print-recall.component.html',
  styleUrls: ['./print-recall.component.css']
})
export class PrintRecallComponent implements OnInit {
  recallId: any;
  currentUser!: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  isLoading: boolean = false;
  recallDetails: any = {};
  details: any = {};
  signatory: any = {};
  isEdit: boolean = false;
  printTemplates:any[] = [];
  selectedTemplateId: any;
  selectedTemplateType: any;
  removeSignature = false;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private http: HttpClient) {
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
 }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.recallId = this.route.snapshot.paramMap.get('id')!;      
      this.getbase64image();
      this.getPrintTemplates();
      this.getLetter();
    }
  }

  
  LoadrecallDetails() {
    this.isLoading = true;
    
    this.httpService.HRgetById(APIURLS.RECALL_GET_DETAILS_BY_ID, this.recallId).then((data: any) => {
      if (data) {
        this.recallDetails = data;   
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;      
    });
  }

  getLetter() {
    this.isLoading = true;
    
    this.httpService.HRget(APIURLS.RECALL_GET_LETTER_FOR_PRINT+"/"+this.recallId).then((data: any) => {
      if (data) {
        this.details = data;        
        this.GetSignatoryDetails();
        this.LoadrecallDetails();
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
          }
        });
    }
  }
  
  getPrintTemplates(){
    //console.log(event.target.value);
    this.httpService.HRget(APIURLS.RECALL_GET_PRINT_TEMPLATES).then((data: any) => {
      if (data.length > 0) {
        this.printTemplates = data.sort((a:any, b:any) => { if (a.templateName > b.templateName) return 1; if (a.templateName < b.templateName) return -1; return 0; });
      }
    }).catch((error)=> {
      this.printTemplates = [];
    });
  }
  
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
   // this.createPDF().open();
  }

  createPDF() {
    var printContents = document.getElementById('pdfcontent').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED";//+','+this.locationname;
    var address = "REGD. & CORPORATE OFFICE: # 31, RACE COURSE ROAD, BENGALURU 560 001, KARNATAKA, INDIA";
    var contactInfo = "Tel. : +91- 80-2237 0451- 57 Fax : +91-80-2237 0463 CIN: U24232KA1973PLC002d01 Website: www.microlabsltd.com Email : info@microlabs.in";
    var logo = this.image;
    // pdfMake.fonts = {     
    //   Times: {
    //     normal: 'Times-Roman',
    //     bold: 'Times-Bold',
    //     italics: 'Times-Italic',
    //     bolditalics: 'Times-BoldItalic'
    //   }
    // };
    /*var htmnikhitml = htmlToPdfmake(`<html>
  <head>
  </head>
  <body>
  ${printContents}
  <div>     
  </div>
  </body>  
  </html>`, {
      tableAutoSize: true,
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
    })*/;
    var docDefinition = {
      info: {
        title: 'Recall Letter',
      },

      content: [
     //   htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 10,
        // fontStyle: 'normal',
        // font: 'Times',
        p: { margin: [10, 15, 10, 10] },
        img: { margin: [0, 0, 0, 0] },
        b: { margin: [0, 0, 0, 0] },
        bold: false,
        table: {
          width: '*',
        },
        th: { bold: true, fillColor: '#8B0000' }
      },
      stack: [{
        unbreakable: true,
      }],
      styles:{
        "pull-right": {
          textAlign: "right"
        }
      },
      pageBreak: "after",
      pageSize: 'A4',
      pageMargins: [40, 130, 40, 10],
      pageOrientation: 'portrait',
      header: function (currentPage:any, pageCount:any) {
        return {
          columns: [
            {
              alignment: 'center',
              stack: [
                { image: logo, width: 80, height: 60 },
                { text: OrganisationName, bold: true, fontSize: 16 },
                { text: address, fontSize: 9 },
                { text: contactInfo, fontSize: 8 },
              ],
              width: '*',
              margin: [0, 0, 0, 0],
              height: 130
            }
          ],
          margin: 20
        }
      },
    };
    
//    return pdfMake.createPdf(docDefinition);
  }
  isEmailValid:any;
  validateEmail(email:any)
  {
    const expression: RegExp = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;

    this.isEmailValid = expression.test(email);
    
    console.log('e-mail is ' + (this.isEmailValid  ? 'correct' : 'incorrect'));
  }
  sendEmail() {
    this.validateEmail(this.recallDetails.issuingPersonEmail);
    if(this.isEmailValid==false||this.recallDetails.personalEmailId == undefined || this.recallDetails.personalEmailId == ''){
      toastr.error("Please enter email Id.");
      return;
    }
    if (confirm("Are you sure you want to send email?")) {
      var request: any = {};
      request.recallId = this.recallDetails.recallId;
      request.submittedById = this.currentUser.uid;
      request.submittedByName = this.currentUser.fullName;
      request.emailId = this.recallDetails.personalEmailId;
      request.letterType = 'Recall';//this.printTemplates.find(x=>x.printTemplateId==this.selectedTemplateId).templateType;

      this.isLoading = true;
      // this.createPDF().getBase64((encodedString) => {
      //   if (encodedString) {
      //     request.attachment = encodedString;
      //     toastr.info("Sending email...");
      //     this.isLoading = true;
      //     this.httpService.HRpost(APIURLS.RECALL_DETAILS_SEND_EMAIL, request).then((data: any) => {
      //       if (data == 200 || data.success) {
      //         toastr.success("Successfully emailed the recall letter to the candidate.");
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
    this.router.navigate(['/HR/recall/recall-list']);
  }

print1(): void {
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
  }


