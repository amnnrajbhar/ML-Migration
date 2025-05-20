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
import swal from 'sweetalert';
declare var $: any;
declare var toastr: any;
import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
import { SafeHtmlPipe } from '../../Services/safe-html.pipe';
import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {Pipe, PipeTransform} from "@angular/core";
import { Util } from '../../Services/util.service';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.css'],
  providers:[Util]
})

export class PrintComponent implements OnInit {
  appointmentId: any;
  currentUser: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  isLoading: boolean = false;
  details: any = {};
  appointmentDetails: any = {};
  personalDetails: any = {};
  signatory: any = {};
  removeSignature = false;
  printTemplates:any[] = [];
  selectedTemplateId: any;
  canPrint = false;
  canEmail = false;
  canDownload = false;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private http: HttpClient, private util: Util) { 
      pdfMake.vfs = pdfFonts.pdfMake.vfs;       
    }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.appointmentId = this.route.snapshot.paramMap.get('id')!;          
      this.canPrint = this.util.hasPermission(PERMISSIONS.HR_PRINT_LETTERS);
      this.canEmail = this.util.hasPermission(PERMISSIONS.HR_EMAIL_LETTERS);
      this.canDownload = this.util.hasPermission(PERMISSIONS.HR_DOWNLOAD_LETTERS);
      this.getAppointmentDetails();
      this.getAppointmentPersonalDetails();
      this.getbase64image();
    }
  }
  
  getPrintTemplates(){
    if (this.appointmentDetails.plantId > 0 && this.appointmentDetails.payGroupId > 0 && this.appointmentDetails.employeeCategoryId > 0){
      this.httpService.HRget(APIURLS.APPOINTMENT_GET_PRINT_TEMPLATES+ "/" + this.appointmentDetails.plantId + "/" + this.appointmentDetails.payGroupId +"/"+this.appointmentDetails.employeeCategoryId)
      .then((data: any) => {
        if (data.length > 0) {
          this.printTemplates = data.sort((a, b) => { if (a.templateName > b.templateName) return 1; if (a.templateName < b.templateName) return -1; return 0; });
        }
      }).catch(error => {
        this.printTemplates = [];
      });
    }
  }

  getAppointmentDetails(){
    this.isLoading = false;
    if(this.appointmentId > 0){
      
      this.isLoading = true;

      this.httpService.HRget(APIURLS.APPOINTMENT_GET_OFFICIAL_DETAILS + "/" + this.appointmentId)
      .then((data: any) => {
        if (data) {
          this.appointmentDetails = data;
          this.selectedTemplateId = data.printTemplateId;
          this.getPrintTemplates();      
          this.getLetter();    
        }
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        swal("Error occurred while fetching details, please check the link.");
      });
    }
  }

  
  getAppointmentPersonalDetails(){
    this.isLoading = false;
    if(this.appointmentId > 0){
      
      this.isLoading = true;

      this.httpService.HRget(APIURLS.APPOINTMENT_GET_PERSONAL_DETAILS + "/" + this.appointmentId)
      .then((data: any) => {
        if (data) {
          this.personalDetails = data;
        }
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        swal("Error occurred while fetching details, please check the link.");
      });
    }
  }
  
  getLetter() {
    this.isLoading = true;
    if(this.selectedTemplateId <= 0){
      swal("select a print template.");
      return;
    }
    this.httpService.HRget(APIURLS.APPOINTMENT_GET_LETTER_FOR_PRINT+"/"+this.appointmentId+"?templateId="+this.selectedTemplateId).then((data: any) => {
      if (data) {
        this.details = data;        
        if(data.success == false){
          toastr.error(data.message);
        }else{
          this.GetSignatoryDetails();
        }
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;      
    });
  }

  saveLetter(){
    this.createPDF(false).getBase64((encodedString) => {
      if (encodedString) {
        var request: any = {};
        request.attachment = encodedString;      
        request.employeeId = this.personalDetails.employeeId;
        request.objectId = this.appointmentId;
        request.objectType = "Appointment Letter";
        request.letterType = "Appointment Letter";
        request.submittedById = this.currentUser.uid;
        request.submittedByName = this.currentUser.fullName;
        this.util.saveLetter(request);
      }
    });
  }
  
  saveLetterActivity(activity: string){
    console.log("saving letter..."+ activity);
    var request: any = {}; 
    request.objectId = this.appointmentId;
    request.objectType = "Appointment Letter";
    request.letterType = "Appointment Letter";
    request.activity = activity;
    request.activityById = this.currentUser.uid;
    this.util.saveLetterActivity(request);
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

        if(this.details.secondImageUrl != null && this.details.secondImageUrl != undefined){
          this.http.get('../../..' + this.details.secondImageUrl, { responseType: 'blob' })
        .subscribe(blob => {
          const reader = new FileReader();
          const binaryString = reader.readAsDataURL(blob);
          reader.onload = (event: any) => {
            //this.signatory.image = event.target.result;
            this.details.content = this.details.content.replace("{SECOND_SIGNATORY_IMAGE}",event.target.result);
            setTimeout(()=>{this.saveLetter();}, 100);
          }
        });
      }
    }
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
    this.createPDF(false).open();
    this.saveLetterActivity("Downloaded");
  }
  
  createPDF(forPrinting: boolean) {
    //var printContents = document.getElementById('pdfcontent').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED";//+','+this.locationname;
    var address = "REGD. & CORPORATE OFFICE: # 31, RACE COURSE ROAD, BENGALURU 560 001, KARNATAKA, INDIA";
    var contactInfo = "Tel. : +91- 80-2237 0451- 57 Fax : +91-80-2237 0463 CIN: U24232KA1973PLC002d01 Website: www.microlabsltd.com Email : info@microlabs.in";
    var footNote = "Please note that your remuneration package is strictly Confidential between you and the Organization and any breach of this confidentiality on your part would be viewed seriously.";
    var logo = this.image;
    var appointmentNo = this.details.appointmentNo;
    var candidateName = this.details.candidateName;
    var pageMarginsConfig =  [40, 50, 40, 80];

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
      margin: [0, -30, 0, 0],
      height: 140     
    };

    if(forPrinting == true){
      header = {};
      if(this.removeSignature == true)
        $(pdfContent).find(".imgSign").replaceWith('<br/><br/><br/>');
      
      printContents = $(pdfContent).html();
      printContents = "<div style='margin-top:70px;'>&nbsp;</div>"+printContents; 
      //pageMarginsConfig =  [40, 40, 40, 50];
    }
  
    var htmnikhitml = htmlToPdfmake(`<html>
  <head>
  </head>
  <body>  
  ${printContents}  
  </body>  
  </html>`, {
      tableAutoSize: true,
      headerRows: 1,      
      dontBreakRows: true,
      keepWithHeaderRows: true,
      defaultStyles: {      
       td: {         
        border: undefined
        },
        img: undefined,
        p: undefined       
      }
    });

    var docDefinition = {
      info: {
        title: 'Appointment Letter',
      },
      content: [
        header,
        htmnikhitml
      ],
      defaultStyle: {
        //font: 'TimesNewRoman',
        fontSize: 10,
        // fontStyle: 'normal',
        // font: 'Times',
        p: { margin: [10, 5, 10, 10], alignment: 'justify' },
        div: {unbreakable: true},
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
      styles:{
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
          margin: [0, 5, 0, 10], 
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
      tableAutoSize: true,
      pageBreak: "after",
      pageSize: 'A4',
      pageMargins:  pageMarginsConfig,
      pageOrientation: 'portrait',
      imagesByReference: true,      
      header: function (currentPage, pageCount) {        
          if(currentPage != 1){
            return {
              columns: [
                {
                  alignment: 'left',
                  width: '70%',
                  stack: [
                    {text: appointmentNo},
                    {text: candidateName}
                  ],
                },
                {text: "Page "+currentPage+" of "+pageCount, width: '30%', alignment: 'right'}
              ],
              margin: [40, 10, 40, 10]
            };
          }
          else return {};
      },
      footer: function (currentPage, pageCount) {
        if(currentPage != pageCount) return {};
        return {
              alignment: 'left',
              text: footNote, 
              fontSize: 9,
              width: '100%',
              margin: [40, 5, 40, 5],
        }
      },
      pageBreakBefore: function (currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) {
        if (currentNode.style && currentNode.style.indexOf('newPage') > -1)
          return true;
        else if (currentNode.style && currentNode.style.indexOf('lastNode') > -1 && followingNodesOnPage.length < 10)
          return true;
        else 
          return false;
      }
    };   

    var fonts = {
      TimesNewRoman: {
        normal: "https://db.onlinewebfonts.com/t/32441506567156636049eb850b53f02a.ttf",       
        bold: "https://db.onlinewebfonts.com/t/9ddfee5c410187b783c0be8d068a8273.ttf",       
        italics: "https://db.onlinewebfonts.com/t/97fe1ef2f9f6cdac38897d731b88a774.ttf",       
        bolditalics: "https://db.onlinewebfonts.com/t/00cecb8a39000cd7562b4c9fd1ae33cb.ttf",       
        //normal: "../../../assets/fonts/TimesNewRoman.ttf",          
      }
    };

    return pdfMake.createPdf(docDefinition, null);
  }
  
  sendEmail() {
    if (confirm("Are you sure you want to send email?")) {
      var request: any = {};
      request.appointmentId = this.appointmentId;
      request.submittedById = this.currentUser.uid;
      request.submittedByName = this.currentUser.fullName;

      this.createPDF(false).getBase64((encodedString) => {
        if (encodedString) {
          request.attachment = encodedString;
          swal("Sending email...");
          this.httpService.HRpost(APIURLS.APPOINTMENT_SEND_LETTER, request).then((data: any) => {
            if (data == 200 || data.success) {
              swal("Successfully emailed the appointment letter to the candidate.");
              this.saveLetterActivity("Emailed");
            } else if (!data.success) {
              swal(data.message);
            } else
              swal("Error occurred.");
          }
          ).catch(error => {
            swal(error);
          });
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/HR/appointment/list']);
  }

  
print1(): void {
  this.createPDF(true).print();
  this.saveLetterActivity("Printed");
  return;
  // this.printElement(document.getElementById("print-section"));
    let printContents, popupWin, footerContent;
    printContents = document.getElementById('printable').innerHTML;
    footerContent = document.getElementById('print-footer').innerHTML;

    if(this.removeSignature == true)
      printContents = printContents.replace("imgSign", "imgSign-hidden").replace("imgSign", "imgSign-hidden");

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
          <tfoot class="report-footer">
            <tr>
              <th class="report-footer-cell">
                <div class="footer-space">
                 &nbsp;
                </div>
              </th>
            </tr>
          </tfoot>
        </table>
        <div class="print-footer">
          ${footerContent}
        </div>
        </body>
      </html>`
    );
    popupWin.document.close();
  }
}
