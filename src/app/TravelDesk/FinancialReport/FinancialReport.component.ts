import { AuthData } from '../../auth/auth.model';
import { APIURLS } from '../../shared/api-url';
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { throwError as _observableThrow, of as _observableOf } from 'rxjs';
import 'rxjs/Rx';
//import { HttpClient } from '@angular/common/http';
declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import swal from 'sweetalert';
import { ExcelService } from '../../shared/excel-service';
import htmlToPdfmake from 'html-to-pdfmake';
import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { ExpenseUpdate } from '../ExpenseUpdate/ExpenseUpdate.model';

@Component({
  selector: 'app-FinancialReport',
  templateUrl: './FinancialReport.component.html',
  styleUrls: ['./FinancialReport.component.css']
})
export class FinancialReportComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;
  @ViewChild('myInput') myInputVariable: ElementRef;
  @ViewChild(NgForm) financialForm: NgForm;

  // accsubList: AccountReports[] = [];
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
  filterTypeOfGuest: any[] = [];
  amount: number;
  TotalAmount: number;  
  reportType: string;
  yearMonth: string;
  financialYear: string;
  groupbyList = [];
  filtergroupby: string = null;
  groupbyList1: any[] = [];
  submitting: boolean;
  isSubmitting: boolean;
  exportList: any[];
  aduitpurpose: string; 
  accexpItem: ExpenseUpdate = new ExpenseUpdate();
  payGroup: string;
  Division: string;
  groupbyDivision:any[]=[];
  selectedYear: number;
  years: number[] = [];
  fullYear: string;  
  month: string;
  year: string;
  selectedItems: any[] = [];
  fiscalYear: string;
  calYear: string;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient,
 private https: HttpClient, private excelService: ExcelService) { pdfMake.vfs = pdfFonts.pdfMake.vfs;} 
      
  dropdownList = [];

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

  // private initDatatable1(): void {
  //   let table: any = jQuery('#AccountTable2');
  //   this.tableWidget = table.DataTable({
  //     "order": []
  //   });
  // }

  // private reInitDatatable2(): void {
  //   if (this.tableWidget) {
  //     this.tableWidget.destroy()
  //     this.tableWidget = null
  //   }
  //   setTimeout(() => this.initDatatable(), 0)
  // }
  // private initDatatable2(): void {
  //   let table: any = jQuery('#AccountTable3');
  //   this.tableWidget = table.DataTable({
  //     "order": []
  //   });
  // }

 
    currentUser = {} as AuthData;
  ngOnInit() {    
    this.dropdownList = [
      { item_id: 1, item_text: 'Jan' },
      { item_id: 2, item_text: 'Feb' },
      { item_id: 3, item_text: 'Mar' },
      { item_id: 4, item_text: 'Apr' },
      { item_id: 5, item_text: 'May' },
      { item_id: 6, item_text: 'Jun' },
      { item_id: 7, item_text: 'Jul' },
      { item_id: 8, item_text: 'Aug' },
      { item_id: 9, item_text: 'Sep' },
      { item_id: 10, item_text: 'Oct' },
      { item_id: 11, item_text: 'Nov' },
      { item_id: 12, item_text: 'Dec' }
    ];
    this.path = this.router.url;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);      
    if (chkaccess == true) {
      this.getTypeOfGuestList();
      this.getpayGroupList();
      this.getbase64image();
      // this.groupbyList();
     
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  clearFilter() {
    this.reportType = '';
    this.filterPayGroup = [];
    this.selectedItems = [];
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
  dropdownSettings5 = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',    
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: false
  };
  dropdownSettings7 = {
    singleSelection: false,
    idField: 'id',
    textField: 'typeOfGuest1',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }
  onItemDeSelect(item: any) {
    console.log(item);
  }


  groupByKey(data1, key) {
    return data1.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }; 

  getFilteredList() {
    if (this.filterTypeOfGuest.length == 0 || this.filterTypeOfGuest.length == null) {
      alert("Please Select Guest Type")
      return
    }
    if (this.filterPayGroup.length == 0 || this.filterPayGroup.length == null) {
      alert("Please Select Division")
      return
    }
      this.AccountSubmissionList = [];
      this.groupbyDivision =[];
     this.groupbyList = [];
    let filterModel: any = {}   
       
    if(this.filterTypeOfGuest != null || this.filterTypeOfGuest != undefined){
      filterModel.typeOfGuest = this.filterTypeOfGuest.map(x=>x.typeOfGuest1).join();
    }
    if (this.filterPayGroup != null) {
      filterModel.division =  this.filterPayGroup.map(x=>x.long_Desc).join(",");
    };  
    if(this.financialYear != null || this.financialYear != undefined){
      filterModel.financialYear = this.financialYear;
    } 
    if(this.calYear != null || this.calYear != undefined){
      filterModel.calYear = this.calYear;
    }
    if((this.calYear !=null || this.calYear != undefined) && (this.selectedItems != null || this.selectedItems != undefined)){
      filterModel.calYear = this.calYear;
      filterModel.month = this.selectedItems.map(x=>x.item_id).join();
      this.month = this.selectedItems.map(x=>x.item_text).join();

    }
    
    let connection = this.httpService.post(APIURLS.BR_GET_TRAVEL_FIN_REPORT_DATA, filterModel);
    connection.then((data: any) => {
      if (data) {
        if (data[0].type == 'E') {
          alert(data[0].message);
          this.AccountSubmissionList = [];
          this.reInitDatatable();  
          return;
        }
        else {
           this.AccountSubmissionList = [];
           this.groupbyDivision =[]
          this.AccountSubmissionList = data;
          this.groupbyDivision = data[0].groupTable;          
          this.processData();
          //this.accsubList = data;
          this.TotalExpense();
        }
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.errMsgPop = 'Error fetching Details..';
      this.groupbyDivision = []
      this.AccountSubmissionList = [];
    });
  }

  fontStyle(value: string) {
    return value[0].toUpperCase() + value.slice(1);
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
          var ReportName = "FINANCIAL REPORT";
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
              title: 'FINANCIAL Report',
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

  setFormatedMonthYear(date: any) {
    let dt = new Date(date);
    let formateddate = ("00" + (dt.getMonth() + 1)).slice(-2) + "-" + dt.getFullYear().toString(); 
    return formateddate;
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
      this.http.get(APIURLS.BR_HR_URL + apiKey, this.getHeader())
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

  exportAsXLSX(): void {
    this.exportList = [];
     this.excelService.exporttableAsExcelFile(document.getElementById('pdf1'), 'Financil Report');
  }
  closeSaveModal() {
    jQuery("#saveModal").modal('hide');
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

  onFocus() {
    this.autocompleteTrigger._onChange('');
    this.autocompleteTrigger.openPanel();
  }
  groupBy(objectArray, property) {
    return objectArray.reduce(function (acc, obj) {
      var key = obj[property];
      if (!acc[key]) {
        acc[key] = { count: 1, aggregation: obj.quantity };
      } else {
        let count = acc[key].count + 1;
        let aggregation = acc[key].aggregation += obj.quantity;
        acc[key] = { count: count, aggregation: aggregation };
      }
      return acc;
    }, {});
  }
  
  dataTable: any[] = [];
  private processData() {
    const labelchecked = {};

    this.dataTable = this.groupbyDivision
      .sort((a, b) => {
        const taskComparator = a.division.localeCompare(b.division);
        return taskComparator
          ? taskComparator
          : a.division.localeCompare(b.division);
      })
      .map((x) => {
        const taskColumnSpan = labelchecked[x.division]
          ? 0
          : this.groupbyDivision.filter((y) => y.division === x.division).length;
        labelchecked[x.division] = true;
        return { ...x, taskColumnSpan };
      });
  }

}






