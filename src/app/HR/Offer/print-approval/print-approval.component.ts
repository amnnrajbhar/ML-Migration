import { Component, Input, OnInit } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
//import { Util } from '../Services/util.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert';
declare var $: any;
// import * as pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
// import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { OfferDetails } from '../../models/offerdetails.model';
import { SafeHtmlPipe } from '../../Services/safe-html.pipe';
import {Pipe, PipeTransform} from "@angular/core";
declare var toastr: any;

@Component({
  selector: 'app-print-approval',
  templateUrl: './print-approval.component.html',
  styleUrls: ['./print-approval.component.css']
})
export class PrintApprovalComponent implements OnInit {
  
  editAllowed: boolean = false;
  offerId: any;
  currentUser!: AuthData;
  urlPath: string = '';
  isLoading: boolean = false;
  offerDetails: any = {};
  signatory: any = {};

  previousExpList: any[] = [];
  jdList: any[] = [];
  interviewerList: any[] = [];  
  finalRemarks: any = {};
  interviewRemarksList: any[] = [{criteria:"Education relavant to proposed job", rating: ""},
  {criteria:"Job knowledge", rating: ""},
  {criteria:"Adoptability", rating: ""},
  {criteria:"Attitude/Behavior", rating: ""},
  {criteria:"confidence", rating: ""},
  {criteria:"Communication skills", rating: ""}];
  
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
      this.offerId = this.route.snapshot.paramMap.get('id')!;      
      this.LoadOfferDetails();
      this.GetAdditionalInfo();
    }
  }

  
  LoadOfferDetails() {
    this.isLoading = true;
    
    this.httpService.HRgetById(APIURLS.OFFER_DETAILS_API, this.offerId).then((data: any) => {
      if (data) {
        this.offerDetails = data;   
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;      
    });
  }

  
  GetAdditionalInfo() {   

    if(this.offerId && this.offerId > 0){
      this.isLoading = true;
      this.httpService.HRget(APIURLS.OFFER_GET_ADDITIONAL_INFO+"/"+ this.offerId).then((data: any) => {
        if (data) {
          if(data.previousExpList && data.previousExpList.length > 0)
            this.previousExpList = data.previousExpList;      

          if(data.jdList && data.jdList.length > 0)
            this.jdList = data.jdList;   

          if(data.interviewerList && data.interviewerList.length > 0)
            this.interviewerList = data.interviewerList;   

          if(data.interviewRemarksList && data.interviewRemarksList.length > 0)
            this.interviewRemarksList = data.interviewRemarksList;     

          if(data.finalRemarks && data.finalRemarks != undefined) 
            this.finalRemarks = data.finalRemarks;      
        }
        
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
        toastr.error("Error occurred while fetching details, please check the link.");
      });
    }
  }

  goBack() {
    this.router.navigate(['/HR/offer/offer-list']);
  }

print1(): void {
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
  
  download() {
   // this.createPDF().open();
  }

  createPDF() {
    var printContents = document.getElementById('pdfcontent').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED";//+','+this.locationname;
    var address = "REGD. & CORPORATE OFFICE: # 31, RACE COURSE ROAD, BENGALURU 560 001, KARNATAKA, INDIA";
    var contactInfo = "Tel. : +91- 80-2237 0451- 57 Fax : +91-80-2237 0463 CIN: U24232KA1973PLC002d01 Website: www.microlabsltd.com Email : info@microlabs.in";
    
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
        title: 'Recruitment Approval Form',
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
      pageMargins: [40, 30, 40, 10],
      pageOrientation: 'portrait',
      header: function (currentPage:any, pageCount:any) {
        return {
          columns: [
            {
              alignment: 'center',
              stack: [                
                { text: OrganisationName, bold: true, fontSize: 12 },
              ],
              width: '*',
              margin: [0, 0, 0, 0],
              height: 30
            }
          ],
          margin: 20
        }
      },
    };
    
//    return pdfMake.createPdf(docDefinition);
  }

}
