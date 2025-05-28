import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { Location } from '@angular/common';
import { NgForm } from '@angular/forms';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { APIURLS } from '../../../shared/api-url';
import { AppointmentService } from '../../Services/appointmentService.service';
import { AuthData } from '../../../auth/auth.model';
import { Util } from '../../Services/util.service';
import swal from 'sweetalert';
declare var toastr: any;
declare var $: any;
// import * as pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
import { SafeHtmlPipe } from '../../Services/safe-html.pipe';
// import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {Pipe, PipeTransform} from "@angular/core";

@Component({
  selector: 'app-joining-report',
  templateUrl: './joining-report.component.html',
  styleUrls: ['./joining-report.component.css'],
  providers: [AppointmentService, Util]
})
export class JoiningReportComponent implements OnInit {

  appointmentId: any;
  currentUser!: AuthData;
  isLoading: boolean = false;
  personalDetails: any ={};
  officialDetails: any ={};
  addressDetails: any[] =[];
  nominationDetails: any[] = [];
  bankDetails: any = {};
  permanentAddress:any = {};
  mailingAddress:any = {};
  
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private http: HttpClient, private service: AppointmentService, private util: Util, private location: Location) 
    { 
//pdfMake.vfs = pdfFonts.pdfMake.vfs;
}

  ngOnInit() {
      this.appointmentId = this.route.snapshot.paramMap.get('id')!;
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.GetPersonalData();
      this.GetOfficialData();
      this.GetAddressDetails();
      this.GetNominationDetails();
      this.GetBankDetails();      
      this.getbase64image();
  }

  
  GetPersonalData() {
    
    this.isLoading = true;
    this.httpService.HRget(APIURLS.APPOINTMENT_GET_PERSONAL_DETAILS + "/" + this.appointmentId)
    .then((data: any) => {
        if (data) {
          this.personalDetails = data;
        }
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
        swal("Error occurred while fetching details, please check the link.");
      });
  }
  
  GetOfficialData() {
    
    this.isLoading = true;
    this.httpService.HRget(APIURLS.APPOINTMENT_GET_OFFICIAL_DETAILS + "/" + this.appointmentId)
    .then((data: any) => {
        if (data) {
          this.officialDetails = data;
        }
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
        swal("Error occurred while fetching details, please check the link.");
      });
  }
  
  GetAddressDetails() {
    
    this.isLoading = true;
    this.httpService.HRget(APIURLS.APPOINTMENT_GET_ADDRESS_DETAILS + "/" + this.appointmentId)
    .then((data: any) => {
        if (data) {
          this.addressDetails = data;
          this.permanentAddress = data.find(x=>x.addressTypeId == 1);
          this.mailingAddress = data.find(x=>x.addressTypeId == 3);
        }
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
        swal("Error occurred while fetching details, please check the link.");
      });
  }
  
  GetNominationDetails() {
    
    this.isLoading = true;
    this.httpService.HRget(APIURLS.APPOINTMENT_GET_NOMINATION_DETAILS + "/" + this.appointmentId)
    .then((data: any) => {
        if (data) {
          this.nominationDetails = data;
        }
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
        swal("Error occurred while fetching details, please check the link.");
      });
  }

  GetBankDetails() {
    
    this.isLoading = true;
    this.httpService.HRget(APIURLS.APPOINTMENT_GET_BANK_DETAILS + "/" + this.appointmentId)
    .then((data: any) => {
        if (data) {
          this.bankDetails = data;
        }
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
        swal("Error occurred while fetching details, please check the link.");
      });
  }
  
  print2() {
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

  print(): void {
    // this.printElement(document.getElementById("print-section"));
      let printContents, popupWin;
      printContents = document.getElementById('pdfcontent').innerHTML;
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

  
  download() {
   // this.createPDF().open();
  }
  
  createPDF() {
    var printContents = document.getElementById('pdfcontent').innerHTML;
    var logo = this.image;
    var generatedOn ="Generated On: "+ this.setDateFormate(new Date());
    var generatedBy ="Generated By: "+ this.currentUser.fullName;

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
        title: 'Joining Report',
      },

      content: [
     //   htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 11,
        // fontStyle: 'normal',
        // font: 'Times',
        p: { margin: [10, 15, 10, 10] },
        img: { margin: [0, 0, 0, 0] },
        b: { margin: [0, 0, 0, 0] },
        bold: false,
        table: {
          width: '*',
          margin: [50,10,10,10],
          border:1
        },
        th: { bold: true, fillColor: '#8B0000' },        
      },
      stack: [{
        unbreakable: true,
      }],
      styles:{
        "pull-right": {
          textAlign: "right"
        }        
      },
      tableAutoSize: true,
      pageBreak: "after",
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40],
      pageOrientation: 'portrait',
      imagesByReference: true,
      header: function (currentPage:any, pageCount:any) {
        return {
          // columns: [
          //   {
          //     alignment: 'center',
          //     stack: [
          //       { image: logo, width: 80, height: 60 },
          //     ],
          //     width: '*',
          //     margin: [0, 0, 0, 0],
          //     height: 80
          //   }
          // ],
          // margin: 20
        }
      },
      footer: function (currentPage, pageCount) {
        return {
          columns: [
            {
              alignment: 'left',
              stack: [                
                { text: generatedBy, fontSize: 10 },
                { text: generatedOn, fontSize: 10 },
              ],
              width: '*',
              margin: [40, 0, 0, 20],
              height: 40
            },
            {
              alignment: 'right',
              stack: [                
                { text: "Page "+currentPage+" of "+pageCount, fontSize: 10 }
              ],
              width: '*',
              margin: [0, 0, 40, 20],
              height: 40
            }
          ],
          margin: 10
        }
      },
    };
    
//    return pdfMake.createPdf(docDefinition);
  }

  
  setDateFormate(date: any): string {
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear();
  }

  goBack() {
    this.location.back();
  }

}
