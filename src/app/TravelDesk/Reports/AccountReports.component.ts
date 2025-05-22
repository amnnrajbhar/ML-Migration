import { AuthData } from '../../auth/auth.model';
import { APIURLS } from '../../shared/api-url';
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { throwError as _observableThrow, of as _observableOf } from 'rxjs';
import 'rxjs/Rx';
import { HttpClient } from '@angular/common/http';
declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material';
import swal from 'sweetalert';
import { ExcelService } from '../../shared/excel-service';
import htmlToPdfmake from 'html-to-pdfmake';
import { AccountReports } from './AccountReports.model';
import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { ExpenseUpdate } from '../ExpenseUpdate/ExpenseUpdate.model';
export class actionItemModel {
  eventDate: string;
  division: string;
  department: string;
  gender: string;
  hotelName: string;
  typeOfGuest: string;
  vendorName: string;
  vendorCity: string;
  others: string;
  invoiceNo: number;
  invoiceDate: string;
  amount: number;
  noOfPax: number;
  checkInFavourOf: string;
  remarks: string;
  createdBy: number;
  modifiedBy: number;
  id: number;
  name: string;
  typeOfEvent: string;
  supportings: string;
}

@Component({
  selector: 'app-AccountReports',
  templateUrl: './AccountReports.component.html',
  styleUrls: ['./AccountReports.component.css']
})
export class AccountReportsComponent implements OnInit {

  @ViewChild(NgForm) accountReportForm: NgForm;
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;
  @ViewChild('myInput') myInputVariable: ElementRef;
  @ViewChild(NgForm) accsubForm: NgForm;

  accsubList: AccountReports[] = [];
  AccountSubmissionList: ExpenseUpdate[] = [];
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
  filterPayGroup: any[] = [];
  filterInvoiceNo: number = null;
  filterVendorName: string = null;
  filterDepartment: string = null;
  filterTypeOfGuest: string = null;
  filtertypeOfEvent: string = null;
  filterEmployeeNo: string;
  VendorMasterList: any;
  vendorListCon: any;
  filterInvoiceDate: Date;
  AccountSubmission: any;
  filterCreatedDate: Date;
  reset: any;
  filterNoOfPax: string = null;
  Remarks: string;
  AccSubmittedReferenceNoId: number = null;
  advanceChequeNo: number = null;
  supportings: any;
  remarks: string;
  departmentList: any[] = [];
  filterEventDate: string;
  accountStatus: number;
  paymentStatus: number;
  amount: number;
  TotalAmount: number;
  today = new Date();
  fromDate: any = new Date(
    this.today.getFullYear(),
    this.today.getMonth(),
    this.today.getDate() - 30
  );
  toDate: any = this.today;
  groupbyList = [];
  filtergroupby: string = null;
  groupbyList1: any[] = [];
  submitting: boolean;
  isSubmitting: boolean;
  exportList: any[];
  empId: any;
  groupByList: any[];
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  accexpItem: ExpenseUpdate = new ExpenseUpdate();
  Name: string;
  TypeOfGuest: any;
  EmployeeNo: number;
  EmployeeName: string;
  PayGroup: string;
  TypeOfEvent: string;
  InvoiceNo: number;
  NoOfPax: number;
  Amount: number;
  VendorCity: string;
  Hotel: string;
  Supportings: string;
  vendorName: string;
  selectedVendor: any[] = [];
  payGroup: string;
  selectedPaygroup: any[] = [];
  eventDate: any;
  invoiceDate: any;
  createdOn: string;
  id: number;
  CreatedBy: any;
  Division: string;
  empListCon: any[];
  userList: any[];
  filterEmployeeName: any;
  groupbyDivision: any[] = [];
  

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: Http, private https: HttpClient, private excelService: ExcelService) { pdfMake.vfs = pdfFonts.pdfMake.vfs; }


  private initDatatable(): void {
    let table: any = jQuery('#AccountTable');
    this.tableWidget = table.DataTable({
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
      this.getdepartmentList();
      //this.GroupByList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }


  clearFilter() {
    this.filterDepartment = '';
    this.filterPayGroup = [];
    this.filterTypeOfGuest = '';
    this.filtertypeOfEvent = '';
    this.filterEventDate = '';
    this.filterInvoiceNo = null;
    this.filterInvoiceDate = null;
    this.filterVendorName = '';
    this.filterDepartment = '';
    this.filterCreatedDate = null;
    this.accountStatus = null;
    this.paymentStatus = null;
    this.toDate = this.today;
    this.fromDate = new Date(
      this.today.getFullYear(),
      this.today.getMonth(),
      this.today.getDate() - 30
    );
    // this.filtergroupby='';
  }
  ngAfterViewInit() {
    this.initDatatable();
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

  getdepartmentList() {
    this.errMsg = "";
    this.get("DepartmentMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.filter(x => x.isActive).sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      }
    }).catch(error => {
      this.departmentList = [];
      this.isLoading = false;

    });
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


  TotalExpense() {
    this.amount = 0;
    this.TotalAmount = 0;
    this.errMsgPop = "";
    this.isLoading = false;
    this.groupbyDivision.forEach(element => {
      this.amount = this.amount + element.total;
    });
    this.TotalAmount = this.amount;
  }

  // onItemSelect(item: any) {  
  // }
  // onItemDeSelect(item: any) {
  // }
  // onDeSelectAll(items: any) {
  // }
  // onSelectAll(items: any) {
  // }
  dropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'long_Desc',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  dropdownSetting = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
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
  dropdownSettings3 = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  dropdownSettings4 = {
    singleSelection: false,
    idField: 'id',
    textField: 'typeOfGuest1',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  groupByKey(data1, key) {
    return data1.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };
  

  getFilteredList() {
    //  this.AccountSubmissionList = [];
    this.groupbyList = [];
    let filterModel: any = {}
    if (this.filterPayGroup != null) {
      filterModel.division = this.filterPayGroup.map(x => x.long_Desc).join(",");
    }

    if (this.filterVendorName != null && this.filterVendorName != "") {
      filterModel.vendorName = this.filterVendorName[0]['name'];
    }
    // if (this.filterDepartment != null && this.filterDepartment != "") {
    //   filterModel.department = this.filterDepartment[0]['name'];
    // }

    // filterModel.department = this.filterDepartment[0]['name']
    filterModel.typeOfGuest = this.filterTypeOfGuest;
    filterModel.typeOfEvent = this.filtertypeOfEvent;
    filterModel.invoiceNo = this.filterInvoiceNo;
    filterModel.accountStatus = this.accountStatus;
    filterModel.paymentStatus = this.paymentStatus;
    filterModel.GroupBy = this.filtergroupby;
    filterModel.invoiceDate = this.filterInvoiceDate ? this.setFormatedDateTime1(this.filterInvoiceDate) : null;
    filterModel.eventDate = this.filterEventDate ? this.setFormatedDateTime1(this.filterEventDate) : null;
    filterModel.fromDate = this.fromDate ? this.setFormatedDateTime1(this.fromDate) : null;
    filterModel.toDate = this.toDate ? this.setFormatedDateTime1(this.toDate) : null;
    let connection = this.httpService.post(APIURLS.BR_GET_TRAVEL_REPORT_DATA, filterModel);

    connection.then((data: any) => {
      if (data) {
        if (data[0].type == 'E') {
          alert(data[0].message);
          this.AccountSubmissionList = [];
          this.reInitDatatable();
          return;
        }
        else {
          //  this.AccountSubmissionList = [];
          this.AccountSubmissionList = data;
          this.groupbyDivision = data[0].groupTable
          
          

          this.TotalExpense();

          if (this.filtergroupby) {
            var groupedByData = this.groupByKey(this.AccountSubmissionList, this.filtergroupby)
            console.log(groupedByData);
            // console.log(Object.keys(groupedByData));

            (Object.keys(groupedByData)).forEach(x => {
              this.groupbyList.push(
                {
                  name: x,
                  subtotal: (groupedByData[x].map(x => x.amount)).reduce(function (a, b) { return a + b; }, 0)
                }
              )
            })
          }
        }
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.errMsgPop = 'Error fetching Details..';
      this.AccountSubmissionList = [];
    });
  }

  private initReportDatatable(): void {
    let exampleId: any = jQuery('#userTable');
    this.tableWidget1 = exampleId.DataTable();
  }

  private reInitReportDatatable(): void {
    if (this.tableWidget1) {
      this.tableWidget1.clear();

      this.tableWidget1.destroy();
      this.tableWidget1 = null
    }
    setTimeout(() => this.initReportDatatable(), 0)
  }
  fontStyle(value: string) {
    return value[0].toUpperCase() + value.slice(1);
  }

  GetGroupByData() {
    this.groupbyList = [];
    if (this.AccountSubmissionList.length > 0) {
      if (this.filtergroupby != "None" || this.filtergroupby != null) {
        var groupedByData = this.groupByKey(this.AccountSubmissionList, this.filtergroupby)
        console.log(groupedByData);
        // console.log(Object.keys(groupedByData));

        (Object.keys(groupedByData)).forEach(x => {
          this.groupbyList.push(
            {
              name: x,
              subtotal: (groupedByData[x].map(x => x.amount)).reduce(function (a, b) { return a + b; }, 0)
            }
          )
        })
      }
    }
    else {
      this.getFilteredList();
    }
  }


  Print() {
    swal
      ({
        title: "Message",
        text: "Are you sure to Print?",
        icon: "warning",
        dangerMode: false,
        buttons: [true, true]
      }).then((willsave) => {
        if (willsave) {
          var printContents = document.getElementById('pdf1').innerHTML;
          var OrganisationName = "MICRO LABS LIMITED";
          var ReportName = "EXPENSE REPORT";
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
  </html>`,
            {
              tableAutoSize: true,
              headerRows: 1,
              dontBreakRows: true,
              keepWithHeaderRows: true,
            })
          var docDefinition = {
            info: {
              title: 'Expense Report',
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

            // pageMargins: [40, 80, 40, 60],
            pageOrientation: 'landscape',
            header: function (currentPage, pageCount) {
              return {

                columns: [
                  {
                    pageMargins: [40, 80, 40, 60],

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
                          widths: [100, 595, 85],
                          // widths: [90, 600, 90],

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

                    stack: [
                      // { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + jsDate + '.', alignment: 'left' },

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

  exportAsXLSX(): void {
    this.exportList = [];
    this.excelService.exporttableAsExcelFile(document.getElementById('pdf1'), 'AccountSubmissionReport');
  }
  closeSaveModal() {
    jQuery("#saveModal").modal('hide');
  }

  onEditExpense(isEdit: boolean, data: any) {

    this.accountReportForm.form.markAsPristine();
    this.accountReportForm.form.markAsUntouched();
    this.accountReportForm.form.updateValueAndValidity();
    this.selectedPaygroup = [];
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = false;
    this.aduitpurpose = '';
    this.id = data.id;
    this.Name = data.name;
    this.filterTypeOfGuest = data.typeOfGuest;
    this.EmployeeNo = data.employeeId;
    this.EmployeeName = data.employeeName;
    this.payGroup = data.division;
    this.selectedPaygroup = this.payGroupList.filter(x => x.long_Desc == data.division);
    this.TypeOfEvent = data.typeOfEvent;
    this.InvoiceNo = data.invoiceNo;
    this.eventDate = data.eventDate;
    this.invoiceDate = data.invoiceDate
    this.NoOfPax = data.noOfPax;
    this.Amount = data.amount;
    this.vendorName = data.vendorName;
    this.selectedVendor = this.VendorMasterList.filter(x => x.name == data.vendorName);
    this.VendorCity = data.vendorCity;
    this.Hotel = data.hotelName;
    this.Remarks = data.remarks;
    this.Supportings = data.supportings;
    this.CreatedBy = data.createdBy;
    this.createdOn = data.createdOn;
    this.Division = data.division;
    jQuery("#myModal").modal('show');
  }


  onupdateExpense(status: boolean) {
    this.errMsg = "";
    this.errMsgPop = "";
    let connection: any;
    if (this.AccountSubmissionList != null) {
      if (!this.isEdit) {
        this.auditType = "Create";
        this.accexpItem.isActive = true;
        connection = this.httpService.post(APIURLS.BR_PUT_TDEXPENSEUPDATE, this.accexpItem);
      }
      else {
        this.auditType = "Update";
        this.accexpItem.name = this.Name;
        this.accexpItem.id = this.id;
        this.accexpItem.typeOfGuest = this.TypeOfGuest;
        this.accexpItem.employeeNo = this.EmployeeNo;
        this.accexpItem.employeeName = this.EmployeeName
        this.accexpItem.division = this.selectedPaygroup[0].long_Desc;
        this.accexpItem.typeOfEvent = this.TypeOfEvent
        this.accexpItem.invoiceNo = this.InvoiceNo
        this.accexpItem.invoiceDate = this.invoiceDate;
        this.accexpItem.eventDate = this.eventDate;
        this.accexpItem.noOfPax = this.NoOfPax
        this.accexpItem.amount = this.Amount
        this.accexpItem.vendorName = this.selectedVendor[0].name;
        this.accexpItem.vendorCity = this.VendorCity
        this.accexpItem.hotelName = this.Hotel
        this.accexpItem.remarks = this.Remarks
        this.accexpItem.supportings = this.Supportings
        this.accexpItem.createdOn = this.createdOn;
        this.accexpItem.createdBy = this.CreatedBy;
        this.accexpItem.modifiedBy = this.currentUser.employeeId;

        connection = this.httpService.put(APIURLS.BR_PUT_TDEXPENSEUPDATE, this.accexpItem.id, this.accexpItem);
      }
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = 'Expense details updated successfully!';
          jQuery("#saveModal").modal('show');
          let Id = !this.isEdit ? data.id : this.accexpItem.id;
          this.getFilteredList();
        }

        this.reInitDatatable();
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error updating expense details ..';
      });
    }
    else {
      this.isLoadingPop = false;
      this.errMsgPop = 'Entered expense type already exists';
    }
  }

  getUserMasterListByIdFilter(id: string) {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.getByParam(APIURLS.BR_EMPLOYEEMASTER_ACTIVE_API_GET_BY_ID, id).then((data: any) => {
      if (data.length > 0) {
        this.userList = data;
        this.empListCon = data.map((i) => {
          i.name = i.firstName + '' + i.middleName + '' + i.lastName + '-' + i.employeeId; return i;
        });

        this.isLoading = false;
      }
    }).catch(error => {
      this.isLoading = false;
      this.userList = [];
    });
  }
  setDet(mtrl: string) {
    var self = this;
    if (mtrl.length >= 3) {
      this.getUserMasterListByIdFilter(mtrl);
    } else {
      this.empListCon = [];
    }
    var data = this.empListCon;
    $('#filterEmployeeNo').autocomplete({
      source: function (request, response) {
        let result = data.filter(x => x.employeeId.includes(mtrl));
        response(result.map((i) => {
          i.label = i.firstName + ' ' + i.middleName + ' ' + i.lastName + '-' + i.employeeId + '-'
          i.name = i.firstName + ' ' + i.middleName + ' ' + i.lastName, i.empNo = i.employeeId; return i;
        }));
      },
      select: function (event, ui) {
        self.filterEmployeeNo = ui.item.empNo;
        self.filterEmployeeName = ui.item.name;

        return false;
      }
    });
  }

  getUserMasterListByIdFilter1(mtrl: string) {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.getByParam(APIURLS.BR_EMPLOYEEMASTER_ACTIVE_API_GET_BY_NAME, mtrl).then((data: any) => {
      if (data.length > 0) {
        this.userList = data;
        this.empListCon = data.map((i) => {
          i.name = i.firstName + '' + i.middleName + '' + i.lastName + '-' + i.employeeId; return i;
        });

        this.isLoading = false;
      }
    }).catch(error => {
      this.isLoading = false;
      this.userList = [];
    });
  }
  setDet1(mtrl: string) {
    var self = this;
    if (mtrl.length >= 3) {
      this.getUserMasterListByIdFilter1(mtrl);
    } else {
      this.empListCon = [];
    }
    var data = this.empListCon;
    $('#EmployeeName').autocomplete({
      source: function (request, response) {
        let result = data.filter(x => x.firstName.includes(mtrl));
        response(result.map((i) => {
          i.label = i.firstName + ' ' + i.middleName + ' ' + i.lastName + '-' + i.employeeId + '-'
          i.name = i.firstName + ' ' + i.middleName + ' ' + i.lastName, i.empNo = i.employeeId; return i;
        }));
      },
      select: function (event, ui) {
        self.filterEmployeeNo = ui.item.empNo;
        self.filterEmployeeName = ui.item.name;

        return false;
      }
    });
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

  onItemSelect(item: any) {
  }
  onItemDeSelect(item: any) {
  }
  onSelectAll(items: any) {
  }
  onDeSelectAll(items: any) {
  }

  onFocus() {
    this.autocompleteTrigger._onChange('');
    this.autocompleteTrigger.openPanel();
  }


  // function Division(id,val,StateName) {
  //   this.id = id;
  //   this.val = val;
  //   this.StateName = StateName;
  // }

  // function getStates() {
  //  return [
  //   new State(1, 1, 'Arizona'),
  //   new State(2, 1, 'Alaska'),
  //   new State(3, 1, 'Florida'),
  //   new State(4, 1, 'Hawaii'),
  //   new State(5, 2, 'Gujarat'),
  //   new State(6, 2, 'Goa'),
  //   new State(7, 2, 'Punjab'),
  //   new State(8, 3, 'Queensland'),
  //   new State(9, 3, 'South Australia'),
  //   new State(10, 3, 'Tasmania'),
  //   new State(11, 4, 'Penang')
  //  ];
  // }

  // var merged = getStates().reduce((current, value, index) => {
  //     if(index > 0)
  //         current += ',';

  //     return current + value.StateName;
  // }, '');

  // console.log(merged);
  // var commaSeperatedString = arrayName.toString(); 


  // auxT: any[] = [];  
  //   if (this.payGroupList != null) {
  //       for (let t of this.payGroupList) {
  //         auxT.push(t);
  //       }
  //     }

}




