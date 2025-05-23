import { AuthData } from '../../auth/auth.model';
import { APIURLS } from '../../shared/api-url';
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
import 'rxjs/Rx';
//import { HttpClient } from '@angular/common/http';
declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { Router } from '@angular/router';
//import { debug } from 'util';
import { FormControl, NgForm } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import swal from 'sweetalert';
import { ExcelService } from '../../shared/excel-service';
import htmlToPdfmake from 'html-to-pdfmake';
import { AccountSubmission } from './AccountSubmission.model';
import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { filter } from 'rxjs-compat/operator/filter';
import { ExpenseUpdate } from '../ExpenseUpdate/ExpenseUpdate.model';
import * as XLSX from 'xlsx';
import { Pipe, PipeTransform } from '@angular/core';


@Component({
  selector: 'app-AccountSubmission',
  templateUrl: './AccountSubmission.component.html',
  styleUrls: ['./AccountSubmission.component.css']
})
@Pipe({ name: 'groupBy' })
export class AccountSubmissionComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;
  @ViewChild(NgForm) userForm: NgForm;
  @ViewChild('myInput') myInputVariable: ElementRef;
  @ViewChild(NgForm) accsubForm: NgForm;
  @ViewChild(NgForm) SubmittedDetailsEditForm: NgForm;
  accsubList: AccountSubmission[] = [];
  accsubItem: AccountSubmission = new AccountSubmission();
  AccountSubmissionList: any[] = [];
  public tableWidget: any;
  public tableWidget1: any;
  public tableWidget2: any;
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  path: string;
  filterPayGroup: string = null;
  filterInvoiceNo: number = null;
  filterVendorName: string = null;
  // filterDepartment: string = null;
  filterTypeOfGuest: string = null;
  filtertypeOfEvent: string = null;
  Amount: number;
  filterEmployeeNo: string;
  VendorMasterList: any;
  vendorListCon: string;
  filterInvoiceDate: Date;
  AccountSubmission: string;
  filterCreatedDate: Date;
  reset: any;
  filterNoOfPax: string = null;
  Remarks: string;
  Supportings: string = null;
  AccSubmittedReferenceNo: string = null;
  advanceChequeNo: number = null;
  supportings: string;
  remarks: string;
  today = new Date();
  fromDate: Date = new Date(
    this.today.getFullYear(),
    this.today.getMonth(),
    this.today.getDate() - 30
  );
  toDate: Date = this.today;
  id: any;
  TypeOfGuest: string;
  Name: string;
  EmployeeNo: string;
  EmployeeName: string;
  TypeOfEvent: string;
  InvoiceNo: number;
  eventDate: Date;
  invoiceDate: string;
  NoOfPax: number;
  VendorCity: string;
  Hotel: string;
  CreatedBy: number;
  createdOn: Date;
  Division: string;
  auditType: string;
  vendorName: string;
  selectedVendor: any[] = [];
  payGroup: string;
  selectedPaygroup: any[] = [];
  status: string;
  oldaccsubItem: AccountSubmission;
  expenseupdate: ExpenseUpdate = new ExpenseUpdate();
  accSubmittedBy: number;
  tableWidget3: any;
  tableWidget4: null;
  exportList: any[];
  columnNames: string[];
  allButLastColumnNames: any;
  rowSpans: any;
  rowSpanComputer: any;
  lastColumnName: string;
  groupbyAccRefNo;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient,
 private https: HttpClient, private excelService: ExcelService) { pdfMake.vfs = pdfFonts.pdfMake.vfs; }


  private initDatatable(): void {
    let exampleId: any = jQuery('#AccountSubmissionTable');
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

  private InitExpenseEditTable(): void {
    let ex1: any = jQuery('#ExpenseEditTable');
    this.tableWidget2 = ex1.DataTable({
      "order": []
    });
  }

  private reInitExpenseEditTable(): void {
    if (this.tableWidget2) {
      this.tableWidget2.destroy()
      this.tableWidget2 = null
    }
    setTimeout(() => this.InitExpenseEditTable(), 0)
  }

  private InitExpenseupdateTable(): void {
    let ex2: any = jQuery('#ExpenseUpdateTable');
    this.tableWidget1 = ex2.DataTable({
      "order": []
    });
  }

  private reInitExpenseupdateTable(): void {
    if (this.tableWidget1) {
      this.tableWidget1.destroy()
      this.tableWidget1 = null
    }
    setTimeout(() => this.InitExpenseupdateTable(), 0)
  }

  // private InitbalanceTable1(): void {
  //   let ex3: any = jQuery('#balanceTable1');
  //   this.tableWidget4 = ex3.DataTable({
  //     "order": []
  //   });
  // }

  // private reInitbalanceTable1(): void {
  //   if (this.tableWidget4) {
  //     this.tableWidget4.destroy()
  //     this.tableWidget4 = null
  //   }
  //   setTimeout(() => this.InitbalanceTable(), 0)
  // }

  private InitbalanceTable(): void {
    let ex: any = jQuery('#balanceTable');
    this.tableWidget3 = ex.DataTable({
      "order": []
    });
  }

  private reInitbalanceTable(): void {
    if (this.tableWidget3) {
      this.tableWidget3.destroy()
      this.tableWidget3 = null
    }
    setTimeout(() => this.InitbalanceTable(), 0)
  }

  currentUser = {} as AuthData;
  ngOnInit() { 
    this.status = "Pending";
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
    this.filterTypeOfGuest = '';
    this.filtertypeOfEvent = '';
    this.filterInvoiceNo = null;
    this.filterInvoiceDate = null;
    this.filterVendorName = '';
    this.filterCreatedDate = null;
    this.fromDate = new Date(
      this.today.getFullYear(),
      this.today.getMonth(),
      this.today.getDate() - 30
    );
    this.toDate = this.today;
  }

  ngAfterViewInit() {
    this.initDatatable();
  }

  amount: number = 0;
  totalAmountPayable: number = 0;
  advanceAmountPaid: number = 0;

  totamount() {
    this.totalAmountPayable = this.amount - +this.advanceAmountPaid;
  }

  totalamount(){
    this.totalAmountPayable = this.amount - +this.advanceAmountPaid;

  }

  totalmount() {
    this.totalAmountPayable = this.amount - +this.advanceAmountPaid;
  }

  closeModal() {
    this.checkUncheckAll();
    //this.checkedRequestList=[];
    // this.reInitModalDatatable();
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

  Unselectall: boolean = false;
  isMasterSel: boolean = false;
  isLoadingReq: boolean = false;
  checkUncheckAll() {

    for (var i = 0; i < this.AccountSubmissionList.length; i++) {
      this.AccountSubmissionList[i].isSelected = this.isMasterSel;
    }
    this.getCheckedItemList();

  }

  checkUncheckAllSubmitted(id) {
    const index = this.AccountSubmissionList.indexOf(id)
    let checked = this.AccountSubmissionList[index].isSelected;
    for (var i = 0; i < this.AccountSubmissionList.length; i++) {
      this.AccountSubmissionList[i].isSelected = this.isMasterSel;
    }
    this.AccountSubmissionList[index].isSelected = checked;
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

  dataTable: any[] = []; 

private processData(){
  const labelchecked = {};
  this.dataTable = this.AccountSubmissionList.sort((a,b) => {
    const taskComparator = a.refno.localeCompare(b.refno);
    return taskComparator
    ? taskComparator
    : a.refno.localeCompare(b.refno);
  })
  .map((x) => {
    const taskColumnSpan = labelchecked[x.refno]
    ? 0
    : this.AccountSubmissionList.filter((y) => y.refno === x.refno).length;
    labelchecked[x.refno] = true;

    return { ...x, taskColumnSpan};
  });
}


  // groupBy(objectArray, property) {
  //   return objectArray.reduce(function (acc, obj) {
  //     var key = obj[property];
  //     if (!acc[key]) {
  //       acc[key] = { count: 1, aggregation: obj.advanceAmountPaid };
  //     } else {
  //       let count = acc[key].count + 1;
  //       let aggregation = acc[key].aggregation += obj.advanceAmountPaid;
  //       acc[key] = { count: count, aggregation: aggregation };
  //     }
  //     return acc;
  //   }, {});
  // }

  getFilteredList() {

    let filterModel: any = {};
    if (this.filterPayGroup != null && this.filterPayGroup != "") {
      filterModel.division = this.filterPayGroup[0]['long_Desc'];
    }

    if (this.filterVendorName != null && this.filterVendorName != "") {
      filterModel.vendorName = this.filterVendorName[0]['name'];
    }
    filterModel.createdBy = this.currentUser.employeeId;
    //filterModel.vendorName = this.filterVendorName[0]['name'];
    filterModel.invoiceNo = this.filterInvoiceNo;
    filterModel.invoiceDate = this.filterInvoiceDate ? this.setFormatedDateTime1(this.filterInvoiceDate) : null;
    //filterModel.division = this.filterPayGroup[0]['long_Desc'];
    filterModel.typeOfEvent = this.filtertypeOfEvent;
    // filterModel.department = this.filterDepartment[0]['name'];
    filterModel.typeOfGuest = this.filterTypeOfGuest;
    //  filterModel.purpose = this.filterPurpose;
    filterModel.fromDate = this.fromDate ? this.setFormatedDateTime1(this.fromDate) : null;
    filterModel.toDate = this.toDate ? this.setFormatedDateTime1(this.toDate) : null;
    filterModel.employeeId = this.filterEmployeeNo;
    filterModel.status = this.status;
    filterModel.createdDate = this.filterCreatedDate ? this.setFormatedDateTime1(this.filterCreatedDate) : null;
    let connection = this.httpService.post(APIURLS.BR_GET_TRAVEL_EXPENSE, filterModel);
    connection.then((data: any) => {
      if (data) {
        if (data[0].type == 'E') {
          alert(data[0].message);
          return;
        }
        else {
          this.AccountSubmissionList = data;
         
          this.AccountSubmissionList.reverse();
          // this.groupbyAccRefNo = this.groupBy(this.AccountSubmissionList, 'accSubmittedReferenceNo');
          this.processData();
        }

      }
      this.reInitDatatable();
      this.clearFilter();
    }).catch(error => {
      this.errMsgPop = 'Error saving Account Submission Details..';
    });
  }


  Submit() {
    swal({
      title: "Message",
      text: "Are you sure to Submit & Print?",
      icon: "warning",
      dangerMode: false,
      buttons: [true, true]
    }).then((willsave) => {
      if (willsave) {
        let Model: any = {};
        Model.advanceChequeNo = this.advanceChequeNo;
        Model.supportings = this.supportings;
        Model.remarks = this.remarks;
        Model.totalAmount = this.amount;
        Model.advanceAmountPaid = this.advanceAmountPaid;
        Model.balanceAmount = this.totalAmountPayable;
        Model.createdBy = this.currentUser.employeeId;
        Model.accSubmittedReferenceNoId = 1;
        Model.id = this.checkedRequestList.map(x => x.id).join();

        let connection = this.httpService.post(APIURLS.BR_POST_TRAVEL_BALANCE, Model);
        connection.then((data: any) => {
          if (data) {
            if (data.type == 'E') {
              alert(data.message);
              return;
            }
            else {

              this.AccountSubmissionList = [];

              this.checkedRequestList = [];
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

          this.Print();
          this.checkUncheckAll();

          this.reInitDatatable();
          this.reInitExpenseEditTable();
        }).catch(error => {
          this.errMsgPop = 'Error saving Account Submission Details..';
        });
      }
    });
  }

  // PrintOnDuty() {
  //   this.onUserActions();
  // }

  // onUserActions1() {
  //   var printContents = document.getElementById('pdf').innerHTML;
  //   var OrganisationName = "MICRO LABS LIMITED";
  //   var ReportName = "ACCOUNT SUBMISSION REPORT";
  //   var printedBy = this.currentUser.fullName;
  //   var now = new Date();
  //   var jsDate = this.setFormatedDateTime(now);
  //   var logo = this.image;
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
  //   })
  //   var docDefinition = {
  //     info: {
  //       title: 'Travel Expense Details Report',
  //     },

  //     content: [
  //       htmnikhitml,
  //     ],
  //     defaultStyle: {
  //       fontSize: 9,
  //       p: { margin: [10, 15, 10, 20] },
  //       bold: false,
  //       table: {
  //         width: '*',
  //       },
  //       th: { bold: true, fillColor: '#8B0000' }
  //     },
  //     stack: [{
  //       unbreakable: true,
  //     }],
  //     pageBreak: "after",
  //     pageSize: 'A4',
  //     pageMargins: [40, 90, 40, 60],
  //     pageOrientation: 'landscape',
  //     header: function (currentPage, pageCount) {
  //       return {

  //         columns: [

  //           {
  //             pageMargins: [60, 100, 60, 80],
  //             style: 'tableExample',
  //             color: '#444',

  //             stack: [
  //               {
  //                 alignment: 'right',

  //                 stack: [
  //                   { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + jsDate + '.', alignment: 'left' }
  //                   //,

  //                   //  { text: 'Page ' + currentPage.toString() + ' of ' + pageCount.toString(), alignment: 'right' }
  //                 ],

  //                 bold: true,
  //                 fontSize: 10,
  //               },
  //               {
  //                 table: {
  //                   widths: [100, 580, 90],
  //                   headerRows: 2,
  //                   keepWithHeaderRows: 1,
  //                   body: [
  //                     [{
  //                       rowSpan: 2, image: logo,
  //                       width: 50,
  //                       alignment: 'center'
  //                     }
  //                       , { text: OrganisationName, bold: true, fontSize: 12, color: 'black', alignment: 'center', height: '*' },
  //                     {
  //                       rowSpan: 2, text: ['Page ', { text: currentPage.toString() }, ' of ',
  //                         { text: pageCount.toString() }], bold: true, fontSize: 10, color: 'black', alignment: 'center'
  //                     }],
  //                     [''
  //                       ,
  //                       { text: ReportName, bold: true, fontSize: 12, color: 'black', alignment: 'center', height: '*' }
  //                       , '']
  //                   ]
  //                 }
  //               }
  //             ]


  //           }
  //         ],
  //         margin: 20
  //       }
  //     },
  //     footer: function (currentPage, pageCount) {
  //       return {

  //         columns: [

  //           {
  //             alignment: 'right',

  //             stack: [
  //               //   { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + jsDate + '.', alignment: 'left' },

  //               { text: 'Page ' + currentPage.toString() + ' of ' + pageCount.toString(), alignment: 'right' }
  //             ],

  //             bold: true,
  //             fontSize: 10,

  //             // width: 120,
  //             // margin: [0, 0, 20, 0]
  //           }

  //         ],
  //         margin: 20
  //       }
  //     },
  //   };
  //   pdfMake.createPdf(docDefinition).open();
  // }

  PrintOnDuty() {
    this.onUserActions1();
  }

  onUserActions1() {
    var printContents = document.getElementById('pdf1').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED";
    var ReportName = "ACCOUNT SUBMISSION REPORT";
    var printedBy = this.currentUser.fullName;
    var now = new Date();
    var jsDate = this.setFormatedDateTime(now);
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
    })
    var docDefinition = {
      info: {
        title: 'Travel Expense Details Report',
      },

      content: [
        htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 9,
        p: { margin: [10, 15, 10, 20] },
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
      pageMargins: [40, 90, 40, 60],
      pageOrientation: 'landscape',
      header: function (currentPage, pageCount) {
        return {

          columns: [

            {
              pageMargins: [60, 100, 60, 80],
              style: 'tableExample',
              color: '#444',

              stack: [
                {
                  alignment: 'right',

                  stack: [
                    { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + jsDate + '.', alignment: 'left' }
                    //,

                    //  { text: 'Page ' + currentPage.toString() + ' of ' + pageCount.toString(), alignment: 'right' }
                  ],

                  bold: true,
                  fontSize: 10,
                },
                {
                  table: {
                    widths: [100, 580, 90],

                    // widths: [90, 350, 90],
                    headerRows: 2,
                    keepWithHeaderRows: 1,
                    body: [
                      [{
                        rowSpan: 2, image: logo,
                        width: 50,
                        alignment: 'center'
                      }
                        , { text: OrganisationName, bold: true, fontSize: 12, color: 'black', alignment: 'center', height: '*' },
                      {
                        rowSpan: 2, text: ['Page ', { text: currentPage.toString() }, ' of ',
                          { text: pageCount.toString() }], bold: true, fontSize: 10, color: 'black', alignment: 'center'
                      }],
                      [''
                        ,
                        { text: ReportName, bold: true, fontSize: 12, color: 'black', alignment: 'center', height: '*' }
                        , '']
                    ]
                  }
                }
              ]


            }
          ],
          margin: 20
        }
      },
      footer: function (currentPage, pageCount) {
        return {

          columns: [

            {
              alignment: 'right',

              stack: [
                //   { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + jsDate + '.', alignment: 'left' },

                { text: 'Page ' + currentPage.toString() + ' of ' + pageCount.toString(), alignment: 'right' }
              ],

              bold: true,
              fontSize: 10,

              // width: 120,
              // margin: [0, 0, 20, 0]
            }

          ],
          margin: 20
        }
      },
    };
    pdfMake.createPdf(docDefinition).open();
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
            resolve(res);
          },
          err => {
            // console.log(err.json());
            reject(err.json());
          });

    });
    return promise;
  }

  onNext(isEdit: boolean, data: AccountSubmission) {
    if (this.checkedRequestList.length == 0) {
      alert("Please select atleast one line to submit!..")
    }
    else {

      this.accsubForm.form.markAsPristine();
      this.accsubForm.form.markAsUntouched();
      this.accsubForm.form.updateValueAndValidity();
      this.supportings = "";
      this.advanceAmountPaid = null;
      this.advanceChequeNo = null;
      this.remarks = "";
      this.amount = 0;
      this.totalAmountPayable = 0;
      this.advanceAmountPaid = 0;
      this.isEdit = isEdit;
      this.errMsgPop = "";
      this.isLoading = false;
      if (this.isEdit) {
        this.checkedRequestList.forEach(element => {
          this.amount = this.amount + element.amount;

        });
        this.totalAmountPayable = this.amount;
      }
      else {
        this.accsubItem = new AccountSubmission();
      }
      this.reInitExpenseEditTable();
      jQuery("#myModal").modal('show');

    }
  }

  onEdit(isEdit: boolean, data: any) {
    if (this.checkedRequestList.length == 0) {
      alert("Please select atleast one line to Edit!..")
    }
    else {
      this.SubmittedDetailsEditForm.form.markAsPristine();
      this.SubmittedDetailsEditForm.form.markAsUntouched();
      this.SubmittedDetailsEditForm.form.updateValueAndValidity();
      this.isEdit = isEdit;
      this.errMsgPop = "";
      this.isLoading = true;
      this.supportings = "";
      this.advanceAmountPaid = null;
      this.advanceChequeNo = null;
      this.remarks = "";
      this.amount = null;
      this.advanceAmountPaid = null;
      this.totalAmountPayable = null;
      this.getTravelBalanceDetails(this.checkedRequestList[0].accSubmittedReferenceNo);
      this.getExpenseDetails(this.checkedRequestList[0].accSubmittedReferenceNo);
      jQuery("#myModal1").modal('show');
      this.reInitExpenseEditTable();
    }
  }

  getTravelBalanceDetails(id) {
    let connection: any;
    this.isLoading = true;

    connection = this.httpService.getById(APIURLS.GET_BALANCE_DETAILS_BY_ID, id);
    connection.then((data) => {
      if (data) {
        this.supportings = data[0].supportings;
        this.advanceAmountPaid = data[0].advanceAmountPaid;
        this.advanceChequeNo = data[0].advanceChequeNo;
        this.remarks = data[0].remarks;
        this.totalAmountPayable = data[0].totalAmount - data[0].advanceAmountPaid;
        this.amount = data[0].totalAmount;
      }
      this.isLoading = false;
    }).catch((error) => {
      this.isLoading = false;
    })
  }

  checkedRequestList1: any[] = [];
  getExpenseDetails(id) {
    let connection: any;
    this.isLoading = true;
    connection = this.httpService.getByParam(APIURLS.GET_EXPENSE_DETAILS_BY_PARAM, id);
    connection.then((data) => {
      if (data) {
        this.checkedRequestList1 = data;
      }
      this.isLoading = false;
    }).catch((error) => {
      this.isLoading = false;
    })
  }


  onUpdateEdited() {
    this.errMsgPop = "";
    if (this.AccountSubmissionList != null) {
      this.accsubItem.supportings = this.supportings;
      this.accsubItem.advanceAmountPaid = this.advanceAmountPaid;
      this.accsubItem.advanceChequeNo = this.advanceChequeNo;
      this.accsubItem.remarks = this.remarks;
      this.accsubItem.accSubmittedBy = this.currentUser.employeeId;
      this.accsubItem.totalAmount = this.amount;
      this.accsubItem.balanceAmount = this.totalAmountPayable;
      this.accsubItem.accSubmittedReferenceNoId = this.AccountSubmissionList[0].accSubmittedReferenceNo;
      let connection: any;
      connection = this.httpService.put(APIURLS.BR_BALANCE_DETAILS_LAST_DEL_, this.accsubItem.accSubmittedReferenceNoId, this.accsubItem);
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.accSubmittedReferenceNoId > 0) {
          jQuery("#myModal1").modal('hide');
          this.errMsgPop1 = 'account details updated successfully!';
          this.PrintOnDuty();
          let Id = !this.isEdit ? data.accSubmittedReferenceNoId : this.accsubItem.accSubmittedReferenceNoId;
        }
        this.reInitDatatable();
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error updating account details ..';
      });
    }
  }


  deleteEdited(data: ExpenseUpdate): void {
    this.expenseupdate = new ExpenseUpdate();
    swal({
      title: "Are you sure to delete?",
      icon: "warning",
      dangerMode: true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        Object.assign(this.expenseupdate, data);
        let connection: any;
        const index = this.checkedRequestList1.indexOf(data);
        this.expenseupdate.accSubmittedReferenceNo = null;
        this.expenseupdate.accountStatus = 0;
        this.expenseupdate.modifiedBy = this.currentUser.employeeId;
        connection = this.httpService.put(APIURLS.BR_EXPENSE_DETAILS_DEL, this.expenseupdate.id, this.expenseupdate);
        connection.then((data1: any) => {
          this.isLoadingPop = false;
          if (data1 == 200 || data1.id > 0) {
            this.errMsgPop1 = ' Account details deleted successfully!';
            this.checkedRequestList1.splice(index, 1);
            this.amount = 0;
            this.checkedRequestList1.forEach(element => {
              this.amount = this.amount + element.amount;
            });
            this.totalAmountPayable = this.amount - this.advanceAmountPaid;
            this.Updatebalancetableamount(data);
            //  this.reInitExpenseupdateTable(); 
            if (this.checkedRequestList1.length <= 0) {
              jQuery("#myModal1").modal('hide');
              this.Deletelastelement(data);
            }
            else {
              jQuery("#myModal1").modal('show');
            }
          }
          this.reInitExpenseupdateTable();
        }).catch(() => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting account submission details..';
        });
      }
    });
  }

  closeSaveModal() {
    jQuery("#myModal1").modal('hide');
  }

  Deletelastelement(data) {
    let connection: any;
    this.expenseupdate.modifiedBy = this.currentUser.employeeId;
    connection = this.httpService.delete(APIURLS.BR_BALANCE_DETAILS_LAST_DEL_, data.accSubmittedReferenceNo);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        this.errMsgPop1 = ' Account details deleted successfully!';
      }
    }).catch(() => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error deleting account submission details..';
    });
  }


  ClearTable() {
    this.AccountSubmissionList = [];
    this.reInitDatatable();
  }

  Updatebalancetableamount(data) {
    this.errMsg = "";
    this.errMsgPop = "";
    if (this.AccountSubmissionList != null) {
      this.accsubItem.supportings = this.supportings;
      this.accsubItem.advanceAmountPaid = this.advanceAmountPaid;
      this.accsubItem.advanceChequeNo = this.advanceChequeNo;
      this.accsubItem.remarks = this.remarks;
      this.accsubItem.accSubmittedBy = this.currentUser.employeeId;
      this.accsubItem.totalAmount = this.totalAmountPayable;
      this.accsubItem.balanceAmount = this.totalAmountPayable - this.advanceAmountPaid;
      this.accsubItem.accSubmittedReferenceNoId = data.accSubmittedReferenceNo;
      let connection: any;
      connection = this.httpService.put(APIURLS.BR_BALANCE_DETAILS_LAST_DEL_, this.accsubItem.accSubmittedReferenceNoId, this.accsubItem);
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.accSubmittedReferenceNoId > 0) {
          let Id = !this.isEdit ? data.accSubmittedReferenceNoId : this.accsubItem.accSubmittedReferenceNoId;
        }
        this.reInitDatatable();
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error updating account details ..';
      });
    }
  }



  Print() {
    this.onUserActions();
  }

  onUserActions() {
    var printContents = document.getElementById('pdf').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED";
    var ReportName = "ACCOUNT SUBMISSION REPORT";
    var printedBy = this.currentUser.fullName;
    var now = new Date();
    var jsDate = this.setFormatedDateTime(now);
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
    })
    var docDefinition = {
      info: {
        title: 'Travel Expense Details Report',
      },

      content: [
        htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 9,
        p: { margin: [10, 15, 10, 20] },
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
      pageMargins: [40, 90, 40, 60],
      pageOrientation: 'landscape',
      header: function (currentPage, pageCount) {
        return {

          columns: [

            {
              pageMargins: [60, 100, 60, 80],
              style: 'tableExample',
              color: '#444',

              stack: [
                {
                  alignment: 'right',

                  stack: [
                    { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + jsDate + '.', alignment: 'left' }
                    //,

                    //  { text: 'Page ' + currentPage.toString() + ' of ' + pageCount.toString(), alignment: 'right' }
                  ],

                  bold: true,
                  fontSize: 10,
                },
                {
                  table: {
                    widths: [100, 580, 90],
                    headerRows: 2,
                    keepWithHeaderRows: 1,
                    body: [
                      [{
                        rowSpan: 2, image: logo,
                        width: 50,
                        alignment: 'center'
                      }
                        , { text: OrganisationName, bold: true, fontSize: 12, color: 'black', alignment: 'center', height: '*' },
                      {
                        rowSpan: 2, text: ['Page ', { text: currentPage.toString() }, ' of ',
                          { text: pageCount.toString() }], bold: true, fontSize: 10, color: 'black', alignment: 'center'
                      }],
                      [''
                        ,
                        { text: ReportName, bold: true, fontSize: 12, color: 'black', alignment: 'center', height: '*' }
                        , '']
                    ]
                  }
                }
              ]


            }
          ],
          margin: 20
        }
      },
      footer: function (currentPage, pageCount) {
        return {

          columns: [

            {
              alignment: 'right',

              stack: [
                //   { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + jsDate + '.', alignment: 'left' },

                { text: 'Page ' + currentPage.toString() + ' of ' + pageCount.toString(), alignment: 'right' }
              ],

              bold: true,
              fontSize: 10,

              // width: 120,
              // margin: [0, 0, 20, 0]
            }

          ],
          margin: 20
        }
      },
    };
    pdfMake.createPdf(docDefinition).open();
  }

  exportAsXLSX(): void {
    this.exportList = [];
    this.excelService.exporttableAsExcelFile(document.getElementById('Excel'), 'AccountSubmissionReport');
  }



   getHeader(): any {
let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
        const headers = new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authData.token
        });
        return { headers: headers };
}

  // groups = Object.values(this.AccountSubmissionList.reduce(function (r, e) {
  //   var key = e.advanceAmountPaid + '|' + e.accSubmittedReferenceNo;
  //   if (!r[key]) r[key] = e;
  //   else {
  //     r[key].accSubmittedReferenceNo = e.accSubmittedReferenceNo;
  //   }
  //   return r;
  // }, {}));



  // var app = angular.module('myApp', []);
  // app.controller('myCtrl', function ($scope) {
  //     $scope.obj = [{ col1: 1, col2: "a", col3: "x" }, { col1: 1, col2: "b", col3: "y" }, { col1: 2, col2: "c", col3: "z" }];
  // });



  // const calculated = this.AccountSubmissionList.reduce((acc, item) => {

  //   let accItem = acc.find(ai => ai.accSubmittedReferenceNo === item.accSubmittedReferenceNo)

  //   if(accItem){
  //       accItem.advanceAmountPaid += item.advanceAmountPaid 
  //   }else{
  //      acc.push(item)
  //   }

  //   return acc;
  // },[])



  // function entryaccSubmittedReferenceNoAlreadyExists(dataEntries, entry) {
  //   for (let dataEntry of dataEntries) {
  //       if (entry.accSubmittedReferenceNo === dataEntry.accSubmittedReferenceNo) {
  //           return true;
  //       }
  //   }
  //   return false;
  // }

  // function updateadvanceAmountPaidtForEntryWithId (dataEntries, entry) {
  //   for (let dataEntry of dataEntries) {
  //       if (entry.accSubmittedReferenceNo === dataEntry.accSubmittedReferenceNo) {
  //           dataEntry.advanceAmountPaid = dataEntry.advanceAmountPaid + entry.advanceAmountPaid;           
  //       }
  //   }
  //   return dataEntries;
  // }

  // let result = [];
  // for (let entry of AccountSubmissionList) {
  //   if (entryaccSubmittedReferenceNoAlreadyExists(result, entry)) {
  //       result = updateadvanceAmountPaidtForEntryWithId (result, entry);
  //   } else {
  //       result.push(entry);
  //   }
  // }

  // console.log(result);

}