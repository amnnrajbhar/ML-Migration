import { Component, Input, OnInit } from '@angular/core';
import { AppComponent } from '../../app.component';
import { AuthData } from '../../auth/auth.model';
import { APIURLS } from '../../shared/api-url';
import { AppService } from '../../shared/app.service';
import { HttpService } from '../../shared/http-service';
//import { Util } from '../Services/util.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert';
declare var $: any;
// import * as pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
// import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient,HttpClientModule } from '@angular/common/http';
import { OfferDetails } from '../models/offerdetails.model';

@Component({
  selector: 'app-print-offer',
  templateUrl: './print-offer.component.html',
  styleUrls: ['./print-offer.component.css']
})
export class PrintOfferComponent implements OnInit {
  offerId: any;
  currentUser!: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  isLoading: boolean = false;
  offerDetails = {} as OfferDetails;
  signatory: any = {};
  isEdit: boolean = false;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, 
    private http: HttpClient) { 
//pdfMake.vfs = pdfFonts.pdfMake.vfs;
}

  ngOnInit() {
    this.urlPath = this.router.url;
      var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
      if (chkaccess == true) {
     const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
        this.offerId = this.route.snapshot.paramMap.get('id')!;
        this.LoadOfferDetails(this.offerId);
        this.getbase64image();
      }
  }

  LoadOfferDetails(id){
    this.isLoading = true;
  
    this.httpService.HRgetById(APIURLS.OFFER_DETAILS_API, id).then((data: any) => {
      if (data) {        
          this.offerDetails = data;
          this.GetSignatoryDetails();
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.offerDetails = null;
    });
  }

  GetSignatoryDetails(){
    this.isLoading = true;
    this.httpService.HRget(APIURLS.OFFER_GET_SIGNATORIES+"?plantId="+this.offerDetails.plantId+"&payGroupId="+this.offerDetails.payGroupId+"&empCategoryId="+this.offerDetails.employeeCategoryId).then((data: any) => {
      if (data) {        
          this.signatory = data;
          this.http.get('../../..' + this.signatory.imageUrl, { responseType: 'blob' })
            .subscribe(blob => {
              const reader = new FileReader();
              const binaryString = reader.readAsDataURL(blob);
              reader.onload = (event: any) => {
                this.signatory.image = event.target.result;
              }});
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.signatory = {};
    });
  }

  print(){
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
  
  image:string;
  getbase64image()
  {
    this.http.get('../../../assets/dist/img/micrologo.png', { responseType: 'blob' })
    .subscribe(blob => {
      const reader = new FileReader();
      const binaryString = reader.readAsDataURL(blob);
      reader.onload = (event: any) => {
        console.log('Image in Base64: ', event.target.result);
        this.image=event.target.result;
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

  download(){
  // this.createPDF().open();
  }

  createPDF(){
    var printContents = document.getElementById('pdfcontent').innerHTML;
    var OrganisationName ="MICRO LABS LIMITED";//+','+this.locationname;
    var address = "REGD. & CORPORATE OFFICE: # 31, RACE COURSE ROAD, BENGALURU 560 001, KARNATAKA, INDIA";
    var contactInfo = "Tel. : +91- 80-2237 0451- 57 Fax : +91-80-2237 0463 CIN: U24232KA1973PLC002d01 Website: www.microlabsltd.com Email : info@microlabs.in";
    var logo = this.image;
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
        title:'Offer Letter',
        },
      
      content: [
     //   htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 10,
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
      pageBreak: "after",
      pageSize: 'A4',
      pageMargins: [40, 100, 40, 10],
      pageOrientation: 'portrait',
      header: function (currentPage:any, pageCount:any) {
        return {          
          columns: [
            {
              alignment: 'center',
              stack: [
                { image: logo, width: 60, height: 40 },
                { text: OrganisationName, bold: true, fontSize:14 },
                { text: address, fontSize:9 },
                { text: contactInfo, fontSize:8 },
              ],
              width:'*',
              margin: [0, 0, 0, 0],
              height: 100            
            }
          ],
          margin: 10
        }
      },
    };

   // return pdfMake.createPdf(docDefinition);
   return null;
  }

  sendEmail(){
    if(this.offerDetails.personalEmailId == ""){
      swal("Please enter email Id.");
      return;
    }
    if(confirm("Are you sure you want to send email?"))
    {
      var request: any = {};
      request.offerId = this.offerDetails.offerId;      
      request.submittedById = this.currentUser.uid;
      request.submittedByName = this.currentUser.fullName;
      request.emailId = this.offerDetails.personalEmailId;

      // this.createPDF().getBase64((encodedString) => {
      //   if (encodedString) {
      //     request.attachment = encodedString;
      //     swal("Sending email...");
      //     this.httpService.HRpost(APIURLS.OFFER_DETAILS_SEND_EMAIL, request).then((data: any) => {
      //       if (data == 200 || data.success) {
      //         swal("Successfully emailed the offer letter to the candidate.");
      //       } else if (!data.success) {
      //         swal(data.message);
      //       } else
      //         swal("Error occurred.");
      //     }
      //     ).catch((error)=> {
      //       swal(error);
      //     });
      //   }
      // });
    }
  }

goBack(){
  this.router.navigate(['/HR/offer-list']);
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
}
