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
import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SafeHtmlPipe } from '../../Services/safe-html.pipe';
import { Pipe, PipeTransform } from "@angular/core";
import swal from 'sweetalert';
import { Location } from '@angular/common';
import { Util } from '../../Services/util.service';


@Component({
  selector: 'app-resignation-print',
  templateUrl: './resignation-print.component.html',
  styleUrls: ['./resignation-print.component.css']
})
export class ResignationPrintComponent implements OnInit {

  resignationId: any;
  currentUser: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  isLoading: boolean = false;
  appraisalDetails: any = {};
  details: any = {};
  signatory: any = {};
  isEdit: boolean = false;
  request: any = {};
  removeSignature = false;
  resignationDetails: any = {};
  employeeId: any;
  resignationStatus: any;
  employeeDetails: any = {};
  statusList = [
    { type: "Probationary", color: "info" },
    { type: "Confirmed", color: "success" },
    { type: "Serving Notice Period", color: "warning" },
    { type: "Resigned And Exited", color: "danger" },
    { type: "Service Extended", color: "warning" },
    { type: "Terminated", color: "danger" },
    { type: "Retired", color: "danger" },
    { type: "FNF Settled", color: "danger" },
  ]

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private http: HttpClient, private location: Location) { pdfMake.vfs = pdfFonts.pdfMake.vfs; }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.resignationId = this.route.snapshot.paramMap.get('id')!;
      this.GetResignationDetailsById(this.resignationId);
      this.getbase64image();
    }
  }


  GetResignationDetailsById(id) {
    this.isLoading = true;
   
    this.httpService.HRget(APIURLS.RESIGNATION_DETAILS_GET_BYID + "/" + id).then((data: any) => {
      if (data) {
         this.resignationDetails=data;
         this.employeeId = data.employeeId;
         this.resignationStatus= this.resignationDetails.status;        
         this.GetEmployeeDetails(data.employeeId);
      }
      this.isLoading = false;
    }).catch(error => {
      this.errMsg= error;
    });
  }

  GetEmployeeDetails(id) {
    if(id > 0){
      this.isLoading = true;
      this.httpService.getById(APIURLS.HR_EMPLOYEE_DETAILS_API, id).then((data: any) => {
        if (data) {
          this.employeeDetails = data;          
          this.employeeDetails.fullName = this.employeeDetails.firstName + ' ' + this.employeeDetails.middleName + ' ' + this.employeeDetails.lastName;          
        }
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;

      });
    }
  }
 

  print() {
    this.createPDF(true).print(); return;

    let printContents, popupWin;
    printContents = document.getElementById('printable').innerHTML;
    
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
  }

  createPDF(forPrinting: boolean) {
    //var printContents = document.getElementById('pdfcontent').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED";//+','+this.locationname;
    var address = "REGD. & CORPORATE OFFICE: # 31, RACE COURSE ROAD, BENGALURU 560 001, KARNATAKA, INDIA";
    var contactInfo = "Tel. : +91- 80-2237 0451- 57 Fax : +91-80-2237 0463 CIN: U24232KA1973PLC002d01 Website: www.microlabsltd.com Email : info@microlabs.in";
    //var footNote = "Please note that your remuneration package is strictly Confidential between you and the Organization and any breach of this confidentiality on your part would be viewed seriously.";
    var footNote = "";
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
        title: 'Resignation Letter',
      },
      content: [
        header,
        htmnikhitml,
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
              columns: [
              {
                alignment: 'left',
                text: footNote,
                fontSize: 9,
                width: '90%'
              },
              {
                alignment: 'right',
                text: "Page "+currentPage+" of "+pageCount,
                fontSize: 10,
                width: '10%'
              }
              ],          
          margin: [40, 5, 40, 5]
        }
      }
    };

    return pdfMake.createPdf(docDefinition);
  }

  sendEmail() {
    if (this.request.emailType == "Custom" && this.request.EmailId == "") {
      swal("Please enter comma separated email Ids.");
      return;
    }

    if (confirm("Are you sure you want to send email?")) {
      //var request: any = {};     
      this.request.resignationId = this.resignationId;
      this.request.submittedById = this.currentUser.uid;
      this.request.submittedByName = this.currentUser.fullName;
      this.request.letterType = "Resignation Letter";
      this.request.templateType = "Resignation Letter";
      
      this.createPDF(false).getBase64((encodedString) => {
        if (encodedString) {
          this.request.attachment = encodedString;
          swal("Sending email...");
          this.httpService.HRpost(APIURLS.RESIGNATION_DETAILS_SEND_EMAIL, this.request).then((data: any) => {
            if (data == 200 || data.success) {
              swal("Successfully emailed the Resignation letter.");
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
    //this.router.navigate(['/HR/actions/appraisal-employeelist']);
    this.location.back();
  }

}

