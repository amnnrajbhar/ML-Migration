import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NgForm,FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { FNFDetails } from '../initiate-fnf/fnfdetails.model';
import { FNFSettlement } from '../initiate-fnf/fnfsettlement.model';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { APIURLS } from '../../../shared/api-url';
import { PERMISSIONS } from '../../../shared/permissions';
import { Util } from '../../Services/util.service';
import { AppComponent } from '../../../app.component';
import { setActionValue } from 'sweetalert/typings/modules/state';
import { Resignation } from '../../separation/resignation/resignation.model';
import { AuthData } from '../../../auth/auth.model';
import { MOMENT } from 'angular-calendar';
import * as moment from 'moment';
import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient, HttpClientModule } from '@angular/common/http';

declare var $: any;
declare var toastr: any;


@Component({
  selector: 'app-print-fnf',
  templateUrl: './print-fnf.component.html',
  styleUrls: ['./print-fnf.component.css'],
  providers:[Util]
})
export class PrintFnfComponent implements OnInit {
  currentUser: AuthData;
  employeeId: any;
  fnfId: any;
  urlPath: string = '';
  isLoading: boolean = false;
  fnfDetails= {} as FNFDetails;
  employeeDetails :any={};
  DateToday :Date ;
  resignationDetails = {} as Resignation;
  joiningDate: any;
  lastWorkingDate: any;
  resignationDate: any;
  details: any = {};
  canPrint = false;
  canEmail = false;
  canDownload = false;
  
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,private fb: FormBuilder,
    private util: Util,private location: Location,private http: HttpClient)
     { pdfMake.vfs = pdfFonts.pdfMake.vfs; }

  ngOnInit() {
    this.DateToday=new Date();
    
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.employeeId = this.route.snapshot.paramMap.get('id')!;  
      this.fnfId = this.route.snapshot.paramMap.get('id2')!;  
      
      this.canPrint = this.util.hasPermission(PERMISSIONS.HR_PRINT_LETTERS);
      this.canEmail = this.util.hasPermission(PERMISSIONS.HR_EMAIL_LETTERS);
      this.canDownload = this.util.hasPermission(PERMISSIONS.HR_DOWNLOAD_LETTERS);

      if (!this.employeeId || this.employeeId <= 0)
      {
        toastr.error("Invalid ID passed.");
        this.router.navigate(['/HR/fnf/view-fnf-list']);
      }
      this.GetEmployeeDetails(this.employeeId);
      this.GetResignationDetails(this.employeeId);
      this.getbase64image();
      if (this.fnfId>0)
      {
        this.GetFNFDetailsById(this.fnfId);
      }
    }
  }
  GetEmployeeDetails(id) {
    this.isLoading = true;
   // this.isVisible=false;
    this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_DETAILS_API, id).then((data: any) => {
      if (data) {
        this.employeeDetails = data;
        console.log(this.employeeDetails);
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;

    });
  }

  settlementDetails: any[] = [];
  headList: any[] = [];
  migratedDetails: any[] = [];
  GetFNFDetailsById(id) {
    this.migratedDetails = [];
    this.httpService.HRget(APIURLS.FNF_GET_DETAILS_BY_ID+"/"+id).then((data: any) => {
      if (data) {
         this.fnfDetails=data;
         this.settlementDetails=data.fnfSettlementDetailsViewModel;
         var earningsList = this.settlementDetails.filter(x=>x.type=='Earnings');
         var deductionsList = this.settlementDetails.filter(x=>x.type=='Deductions');
         var maxCount = earningsList.length > deductionsList.length ? earningsList.length : deductionsList.length;
         for(var i=0; i < maxCount; i++){
          var obj: any = {};
           if(earningsList.length > i){
            obj.earningHead = earningsList[i].head;
            obj.earningDetails = earningsList[i].details;
            obj.earningEligibleAmount = earningsList[i].eligibleAmount;
            obj.earningPayableAmount = earningsList[i].payableAmount;
           }
           if(deductionsList.length > i){
            obj.deductionHead = deductionsList[i].head;
            obj.deductionDetails = deductionsList[i].details;
            obj.deductionEligibleAmount = deductionsList[i].eligibleAmount;
            obj.deductionPayableAmount = deductionsList[i].payableAmount;
           }

          this.migratedDetails.push(obj);
         }
         this.headList=this.settlementDetails;
         this.calculateTotals();
         this.fnfId = this.fnfDetails.fnfId;        
         setTimeout(()=>{this.saveLetter();}, 100);
      }
      this.isLoading = false;
    }).catch(error => {
      toastr.error(error);
    });
  }
  
  calculateTotals(){
    this.details.totalEarningsEligible = 0;
    this.details.totalDeductionsEligible = 0;
    this.details.totalEarningsPayable = 0;
    this.details.totalDeductionsPayable = 0;
    this.details.totalEarnings=0;
    this.details.totalDeductions=0;
    this.details.netPayable=0;

    for(var i=0; i < this.headList.length; i++){
      var settlementHead = this.headList[i].type;
      
      if(settlementHead !=undefined){

          if(settlementHead== "Earnings"){
            this.details.totalEarningsPayable += this.headList[i].payableAmount;
            this.details.totalEarningsEligible += this.headList[i].eligibleAmount;
          }
          else if(settlementHead== "Deductions")
          {
            this.details.totalDeductionsPayable += this.headList[i].payableAmount;
            this.details.totalDeductionsEligible += this.headList[i].eligibleAmount;
          }
        }
      }


      this.details.totalPayable=this.details.totalEarningsPayable-this.details.totalDeductionsPayable;
      this.details.totalEligible=this.details.totalEarningsEligible-this.details.totalDeductionsEligible;
      this.details.netPayable=this.details.totalPayable;

    }
    
  GetResignationDetails(id)
  {
    this.isLoading = true;
    // this.isVisible=false;
    this.httpService.HRgetById(APIURLS.RESIGNATION_DATE_GET_BYEMPID, id).then((data: any) => {
      if (data) {
        this.resignationDetails = data;
        this.lastWorkingDate = this.getDateFormate(this.resignationDetails.lastWorkingDate);
        this.resignationDate = this.getDateFormate(this.resignationDetails.resignationDate);
        this.joiningDate = this.getDateFormate(this.resignationDetails.dateOfJoining);
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  goBack()
  {
    this.location.back();
  }
  isEmailValid:boolean=false;
  validateEmail(email:any)
  {
    const expression: RegExp = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;

    this.isEmailValid = expression.test(email);
    
    console.log('e-mail is ' + (this.isEmailValid  ? 'correct' : 'incorrect'));
  }
  sendEmail() {
    this.validateEmail(this.employeeDetails.personalEmailId);
    if(this.isEmailValid==false || this.employeeDetails.personalEmailId == undefined || this.employeeDetails.personalEmailId==''){
      toastr.error("Please enter valid email Id.");
      return;
    }
    if (confirm("Are you sure you want to send email?")) {
      var request: any = {};
      request.fnfId = this.fnfDetails.fnfId;
      request.submittedById = this.currentUser.uid;
      request.submittedByName = this.currentUser.fullName;
      request.emailId = this.employeeDetails.personalEmailId;
      request.letterType = "FNF Settlement";

      this.isLoading = true;
      this.createPDF().getBase64((encodedString) => {
        if (encodedString) {
          request.attachment = encodedString;
          toastr.info("Sending email...");
          this.isLoading = true;
          this.httpService.HRpost(APIURLS.FNF_DETAILS_SEND_EMAIL, request).then((data: any) => {
            if (data == 200 || data.success) {
              toastr.success("Successfully emailed  letter to the candidate.");
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
        title: 'Full And Final Settlement',
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
        "pull-center": {
          textAlign: "center"
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
    };
    
    return pdfMake.createPdf(docDefinition);
  }
  print1(): void {
    // this.printElement(document.getElementById("print-section"));
      let printContents, popupWin;
      printContents = document.getElementById('printcontent').innerHTML;
      
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
  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "/" + ("00" + (d1.getMonth() + 1)).slice(-2) + "/" +
      ("00" + d1.getDate()).slice(-2);
  }
  
  
  saveLetter(){
    this.createPDF().getBase64((encodedString) => {
      if (encodedString) {
        var request: any = {};
        request.attachment = encodedString;      
        request.objectId = this.fnfId;
        request.employeeId = this.employeeId;
        request.objectType = "FNF";
        request.letterType = "FNF Letter";
        request.submittedById = this.currentUser.uid;
        request.submittedByName = this.currentUser.fullName;
        this.util.saveLetter(request);
      }
    });
  }
 
  
  saveLetterActivity(activity: string){
    console.log("saving letter..."+ activity);
    var request: any = {}; 
    request.employeeId = this.employeeId;
    request.objectId = this.fnfId;
    request.objectType = "FNF";
    request.letterType = "FNF Letter";
    request.activity = activity;
    request.activityById = this.currentUser.uid;
    this.util.saveLetterActivity(request);
  }

}


