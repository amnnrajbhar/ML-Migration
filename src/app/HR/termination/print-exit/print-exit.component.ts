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
declare var $: any;
declare var toastr: any;
import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Termination } from '../termination/termination.model';
import { SafeHtmlPipe } from '../../Services/safe-html.pipe';
import {Pipe, PipeTransform} from "@angular/core";
import { Util } from '../../Services/util.service';

@Component({
  selector: 'app-print-exit',
  templateUrl: './print-exit.component.html',
  styleUrls: ['./print-exit.component.css'],
  providers: [Util]
})
export class PrintExitComponent implements OnInit {
  terminationId: any;
  currentUser: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  isLoading: boolean = false;
  terminationDetails: any = {};
  details: any = {};
  signatory: any = {};
  isEdit: boolean = false;
  printTemplates:any[] = [];
  selectedTemplateId: any;
  selectedTemplateType: any;
  removeSignature = false;
  canPrint = false;
  canEmail = false;
  canDownload = false;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private http: HttpClient, private util: Util) { pdfMake.vfs = pdfFonts.pdfMake.vfs; }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.terminationId = this.route.snapshot.paramMap.get('id')!;      
      this.canPrint = this.util.hasPermission(PERMISSIONS.HR_PRINT_LETTERS);
      this.canEmail = this.util.hasPermission(PERMISSIONS.HR_EMAIL_LETTERS);
      this.canDownload = this.util.hasPermission(PERMISSIONS.HR_DOWNLOAD_LETTERS);
      this.getbase64image();
    }
  }

  
  LoadterminationDetails() {
    this.isLoading = true;
    
    this.httpService.HRgetById(APIURLS.TERMINATION_DETAILS_GET_BYID, this.terminationId).then((data: any) => {
      if (data) {
        this.terminationDetails = data;   
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;      
    });
  }

  getLetter() {
    this.isLoading = true;
    if(this.selectedTemplateId <= 0){
      toastr.error("select a print template.");
      return;
    }
    this.httpService.HRget(APIURLS.TERMINATION_GET_LETTER_FOR_PRINT+"/"+this.terminationId+"/"+this.selectedTemplateId).then((data: any) => {
      if (data) {
        this.details = data;              
        this.LoadterminationDetails();  
        this.GetSignatoryDetails();
      }
      this.isLoading = false;
    }).catch(error => {
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
  
  getPrintTemplates(event: any){
    //console.log(event.target.value);
    this.httpService.HRget(APIURLS.TERMINATION_GET_PRINT_TEMPLATES+"/"+event.target.value).then((data: any) => {
      if (data.length > 0) {
        this.printTemplates = data.sort((a, b) => { if (a.templateName > b.templateName) return 1; if (a.templateName < b.templateName) return -1; return 0; });
      }
    }).catch(error => {
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

  image: string;
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
    this.createPDF().open();
    this.saveLetterActivity("Downloaded");
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
    var htmnikhitml = htmlToPdfmake(`<html>
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
    });
    var docDefinition = {
      info: {
        title: 'termination Letter',
      },

      content: [
        htmnikhitml,
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
      header: function (currentPage, pageCount) {
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
      pageBreakBefore: function (currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) {
        if (currentNode.style && currentNode.style.indexOf('newPage') > -1)
          return true;
        else if (currentNode.style && currentNode.style.indexOf('lastNode') > -1 && followingNodesOnPage.length < 20)
          return true;
        else 
          return false;
      }
    };
    
    return pdfMake.createPdf(docDefinition);
  }

  sendEmail() {
    if(this.terminationDetails.personalEmailId == undefined || this.terminationDetails.pesonalEmailId==''){
      toastr.error("Please enter email Id.");
      return;
    }
    if (confirm("Are you sure you want to send email?")) {
      var request: any = {};
      request.terminationId = this.terminationDetails.terminationId;
      request.submittedById = this.currentUser.uid;
      request.submittedByName = this.currentUser.fullName;
      request.emailId = this.terminationDetails.personalEmailId;
      request.letterType = this.printTemplates.find(x=>x.printTemplateId==this.selectedTemplateId).templateName;

      this.isLoading = true;
      this.createPDF().getBase64((encodedString) => {
        if (encodedString) {
          request.attachment = encodedString;
          toastr.info("Sending email...");
          this.isLoading = true;
          this.httpService.HRpost(APIURLS.TERMINATION_DETAILS_SEND_EMAIL, request).then((data: any) => {
            if (data == 200 || data.success) {
              toastr.success("Successfully emailed the service withdrawn letter to the candidate.");
              this.saveLetterActivity("Emailed");
            } else if (!data.success) {
              toastr.error(data.message);
            } else
            toastr.error("Error occurred.");
            this.isLoading = false;
          }
          ).catch(error => {
            toastr.error(error);
            this.isLoading = false;
          });
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/HR/termination/termination-list']);
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
    this.saveLetterActivity("Printed");
  }

  saveLetter(){
    this.createPDF().getBase64((encodedString) => {
      if (encodedString) {
        var request: any = {};
        request.attachment = encodedString;   
        request.employeeId = this.terminationDetails.employeeId;   
        request.objectId = this.terminationId;
        request.objectType = "Termination";
        request.letterType = this.selectedTemplateType;
        request.submittedById = this.currentUser.uid;
        request.submittedByName = this.currentUser.fullName;
        this.util.saveLetter(request);
      }
    });
  }

  saveLetterActivity(activity: string){
    console.log("saving letter..."+ activity);
    var request: any = {}; 
    request.employeeId = this.terminationDetails.employeeId;
    request.objectId = this.terminationId;
    request.objectType = "Termination";
    request.letterType = this.selectedTemplateType;
    request.activity = activity;
    request.activityById = this.currentUser.uid;
    this.util.saveLetterActivity(request);
  }

}


