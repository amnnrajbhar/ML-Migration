import { AuthData } from '../../auth/auth.model';
import { APIURLS } from '../../shared/api-url';
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Http, RequestOptions, Headers, ResponseContentType } from '@angular/http';
import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
import 'rxjs/Rx';
import { HttpClient } from '@angular/common/http';
declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { Router } from '@angular/router';
import {  NgForm } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material';
import swal from 'sweetalert';
import { ExcelService } from '../../shared/excel-service';
import { PaymentDetails } from './PaymentDetails.model';
import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";


@Component({
  selector: 'app-PaymentDetails',
  templateUrl: './PaymentDetails.component.html',
  styleUrls: ['./PaymentDetails.component.css']
})
export class PaymentDetailsComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;
  @ViewChild(NgForm) userForm: NgForm;
  @ViewChild('myInput') myInputVariable: ElementRef;
  @ViewChild(NgForm) accsubForm: NgForm;

  accsubList: PaymentDetails[] = [];
  accsubItem: PaymentDetails = new PaymentDetails();
  AccountSubmissionList: any[] = [];
  public tableWidget: any;
  public tableWidget1: any;
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  path: string;
  filterPurpose: string = null;
  filterPayGroup: string = null;
  filterInvoiceNo: number = null;
  filterVendorName: string = null;
  // filterDepartment: string = null;
  filterTypeOfGuest: string = null;
  filtertypeOfEvent: string = null;
  Amount: number;
  filterEmployeeNo: string;
  VendorMasterList: any;
  vendorListCon: any;
  filterInvoiceDate: any;
  AccountSubmission: any;
  filterCreatedDate: any;
  reset: any;
  filterNoOfPax: string = null;
  Remarks:string;
  Supportings:string=null;
  AccSubmittedReferenceNoId:number=null;
  advanceChequeNo: number=null;
  supportings: any;
  remarks: any;
  chequeNo: number;
  chequeDate: any;
  chequeIssuedDate:any;
  chequeAmount: any;
  chequeIssueDate: any;
  chequeIssuedTo: string;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: Http,private https: HttpClient, private excelService: ExcelService) { pdfMake.vfs = pdfFonts.pdfMake.vfs; }


  private initDatatable(): void {
    let exampleId: any = jQuery('#AccountPaymentTable');
    this.tableWidget = exampleId.DataTable({
      "order": []
    });
  }

  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy()
      this.tableWidget = null
    }
    setTimeout(() => this.initDatatable(), 0)
  }

  
  //myModalTable

  private initModalDatatable(): void {
    let exampleId1: any = jQuery('#myModalTable');
    this.tableWidget1 = exampleId1.DataTable({
      "order": []
    });
  }

  private reInitModalDatatable(): void {
    if (this.tableWidget1) {
      this.tableWidget1.destroy()
      this.tableWidget1 = null
    }
    setTimeout(() => this.initModalDatatable(), 0)
  }

  currentUser = {} as AuthData;
  ngOnInit() {
    this.path = this.router.url;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.getTypeOfGuestList();
      this.getTypeOfEventList();
      this.getpayGroupList();
      this.getVendorMasterList();
      this.getbase64image();
      //this.reInitDatatable();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  clearFilter() {
    // this.filterDepartment = '';
    this.filterPayGroup = '';
    this.filterPurpose = '';
    this.filterTypeOfGuest = '';
    this.filtertypeOfEvent = '';
    this.filterInvoiceNo = null;
    this.filterInvoiceDate = '';
    this.filterVendorName = '';
    this.filterCreatedDate = '';
  }

  ngAfterViewInit() {
    this.initDatatable();
  }
  amount: any = 0;
  totalAmountPayable: any = 0;
  advanceAmountPaid: any = 0;

  totamount() {
    this.totalAmountPayable = this.amount - +this.advanceAmountPaid;
  }
  closeModal()
  {
    this.checkUncheckAll();
  }
  TypeOfGuestList: any[] = [];
  getTypeOfGuestList() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_GET_TYPE_OF_GUEST).then((data: any) => {
      if (data.length > 0) {
        this.TypeOfGuestList = data;
      }

      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;

    });
  }

  getVendorMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_GET_TDVENDOR_DETAILS_API).then((data: any) => {
      if (data.length > 0) {
        this.VendorMasterList = data;
        this.vendorListCon = data.map((i) => {
          i.name = i.name; return i;
        });
       this.isLoading = false;
      }

    }).catch(error => {
      this.isLoading = false;
      this.VendorMasterList = [];
    });
  }

 

 TypeOfEventList: any[] = [];
 getTypeOfEventList() {
   this.isLoading = true;
   this.httpService.get(APIURLS.BR_GET_TYPEOFEVENT).then((data: any) => {
     if (data.length > 0) {
       this.TypeOfEventList = data;
     }
     // this.reInitDatatable();
     this.isLoading = false;
   }).catch((_error: any) => {
     this.isLoading = false;

   });
 }

  PurposeList: any[] = [];
  getPurposeList() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_GET_PURPOSE).then((data: any) => {
      if (data.length > 0) {
        this.PurposeList = data;
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.PurposeList = [];
    });
  }


  payGroupList: any[] = [];
  getpayGroupList() {
    this.errMsg = "";
    this.get("PayGroupMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.payGroupList = data.sort((a, b) => {
          if (a.long_Desc > b.long_Desc) return 1;
          if (a.long_Desc < b.long_Desc) return -1;
          return 0;
        });
      }
    }).catch(error => {
      this.isLoading = false;
      this.payGroupList = [];
    });
  }

 

  image: string;
  getbase64image() {
    this.https.get('../../assets/dist/img/micrologo.png', { responseType: 'blob' })
      .subscribe(blob => {
        const reader = new FileReader();
        const binaryString = reader.readAsDataURL(blob);
        reader.onload = (event: any) => {
          console.log('Image in Base64: ', event.target.result);
          this.image = event.target.result;
        };

      });
  }

 
  isMasterSel: boolean = false;
  isLoadingReq: boolean = false;
  checkUncheckAll() {
    for (var i = 0; i < this.AccountSubmissionList.length; i++) {
      this.AccountSubmissionList[i].isSelected = this.isMasterSel;
    }
    this.getCheckedItemList();
  }
  isAllSelected() {
    this.isMasterSel = this.AccountSubmissionList.every(function (item: any) {
      return item.isSelected == true;
    })
    this.getCheckedItemList();
  }
  checkedRequestList: any[] = [];
  checkedlist: any[] = [];
  getCheckedItemList() {
    this.checkedRequestList = [];
    this.checkedlist = [];
    for (var i = 0; i < this.AccountSubmissionList.length; i++) {
      if (this.AccountSubmissionList[i].isSelected)
        this.checkedlist.push(this.AccountSubmissionList[i]);
    }
    this.checkedRequestList = this.checkedlist;
  }

  getFilteredList() {
    let filterModel: any = {};
    if(this.filterPayGroup != null && this.filterPayGroup != "")
    {     
      filterModel.division = this.filterPayGroup[0]['long_Desc'];
    }
        
    if(this.filterVendorName != null && this.filterVendorName != "")
    {
      filterModel.vendorName = this.filterVendorName[0]['name'];
    } 
    
    // filterModel.division = this.filterPayGroup[0]['long_Desc'];
    // filterModel.vendorName = this.filterVendorName[0]['name'];
    filterModel.invoiceNo = this.filterInvoiceNo;
    filterModel.invoiceDate = this.filterInvoiceDate ? this.setFormatedDateTime1(this.filterInvoiceDate) : null;
    filterModel.typeOfEvent = this.filtertypeOfEvent;
    // filterModel.department = this.filterDepartment[0]['name'];
    filterModel.typeOfGuest = this.filterTypeOfGuest;
    filterModel.purpose = this.filterPurpose;
    let connection = this.httpService.post(APIURLS.BR_GET_TRAVEL_PAYMENT, filterModel);
    connection.then((data: any) => {
      if (data) {
        if (data[0].type == 'E') {
          alert(data[0].message);
          return;
        }
        else {
          this.AccountSubmissionList = data;
        }

      }
      this.reInitDatatable();
      // this.clearFilter();
    }).catch(error => {
      this.errMsgPop = 'Error saving Account Submission Details..';
    });
  }

  onNext(isEdit: boolean, data: PaymentDetails) {
    if(this.checkedRequestList.length == 0 )
    {
      alert ("Please select details to go to next!..")
    }
    else
    {
      
      this.accsubForm.form.markAsPristine();
      this.accsubForm.form.markAsUntouched();
      this.accsubForm.form.updateValueAndValidity();
      this.chequeAmount=0;
      this.chequeDate="";
      this.chequeIssuedDate="";
      this.chequeIssuedTo="";
      this.errMsgPop = "";
      this.isLoading = false;
      if (this.isEdit) {
        this.AccountSubmissionList.forEach(element => {
        

          });
      }
      else {
        this.accsubItem = new PaymentDetails();
        
      }
     
      jQuery("#myModal").modal('show');
   }
}


  Submit(){
    swal({
      title: "Message",
      text: "Are you sure to Submit & Print?",
      icon: "warning",
      dangerMode: false,
      buttons: [true, true]
    }).then((willsave) => {
      if (willsave) {
        let Model: any = {};
        Model.id = 1;
        Model.chequeNo = this.chequeNo;
        Model.chequeDate = this.chequeDate ? this.setFormatedDateTime1(this.chequeDate) : null;;
        Model.chequeAmount = this.chequeAmount;
        Model.chequeIssuedDate = this.chequeIssuedDate ? this.setFormatedDateTime1(this.chequeIssuedDate) : null;;
        Model.chequeIssuedTo = this.chequeIssuedTo;
        Model.refIds = this.checkedRequestList.map(x => x.id).join();
        let connection = this.httpService.post(APIURLS.BR_POST_TRAVEL_PAYMENT, Model);
        connection.then((data: any) => {
          if (data) {
            if (data.type == 'E') {
              alert(data.message);
              return;
            }
            else {
              this.checkedRequestList = [];
              this.AccountSubmissionList = [];
              this.accsubItem = new PaymentDetails();
              swal({
                title: "Message",
                text: data.message,
                icon: "success",
                dangerMode: false,
                buttons: [true, true]
              })

            }
          }
          jQuery("#myModal").modal('hide');
          this.checkUncheckAll();
          this.reInitDatatable();
          this.clearFilter();

        }).catch(error => {
          this.errMsgPop = 'Error saving Payment Details..';
        });
      }
    })

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
  setFormatedDateTime1(date: any) {
    let dt = new Date(date);
    let formateddate = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
      ("00" + dt.getDate()).slice(-2) + ' ' +
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

  get(apiKey: string): any {
    const promise = new Promise((resolve, reject) => {
      this.http.get(APIURLS.BR_BASE_HR_URL + apiKey, this.getHeader())
        .toPromise()
        .then(
          res => { // Success
            //   //console.log(res.json());
            resolve(res.json());
          },
          err => {
            // console.log(err.json());
            reject(err.json());
          });

    });
    return promise;
  }

  getHeader(): any {
    var headers = new Headers();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'))
    headers.append("Authorization", "Bearer " + authData.token);
    let options = new RequestOptions({ headers: headers });
    return options;
  }
  onItemDeSelect(item: any) {
  }
  onDeSelectAll(items: any) {
  }
  onSelectAll(items: any) {
  }
  dropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'long_Desc',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  dropdownSettings2 = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

}

