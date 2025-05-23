import { AuthData } from '../../auth/auth.model';
import { Chart } from 'chart.js';
import { APIURLS } from '../../shared/api-url';
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { throwError as _observableThrow, of as _observableOf } from 'rxjs';
import 'rxjs/Rx';
declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { Router } from '@angular/router';
//import { debug } from 'util';
import { FormControl, NgForm } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { ExcelService } from '../../shared/excel-service';
import { TravelDashboard } from './TravelDashboard.model';


@Component({
  selector: 'app-TravelDashboard',
  templateUrl: './TravelDashboard.component.html',
  styleUrls: ['./TravelDashboard.component.css']
})
export class TravelDashboardComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;
  @ViewChild(NgForm) userForm: NgForm;
  @ViewChild('myInput') myInputVariable: ElementRef;

  public tableWidget: any;
  // departmentList: any[] = [];
traveldashboard: TravelDashboard = new TravelDashboard();
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  path: string;
  filterEmployeeId: string = null;
  filterPurpose: any;
  typeOfGuestList: any;
  filterPayGroup: string = null;
  filterVendorName: string = null;
  Amount: number = null;
  // filterDepartment: string = null;
  filterTypeOfGuest: string = null;
  filterFromDate:any=0;
  filterToDate:any=0;
  filtertypeOfEvent: string = null;
  filterStatus: number = 1;
  filterType: any = null;
  VendorMasterList: any;
  filterEventDate: string;
  filterInvoiceDate: string;
  ExpenseUpdate: any;
  CreatedBy: any;
  isSubmitting: boolean;
  reset: any;
    empListCon: any;
    userList: any;
    // todayDate = new Date();
    // today: Date = new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), this.todayDate.getDate());
    chart1: any;
    purposeList: any[] = [[]];
    [x: string]: any;
    public tableWidget1;
    chart: any;

  
     empData: AuthData;
     label: any[] = [];
     today = new Date();
     fromDate: any = new Date(
       this.today.getFullYear(),
       this.today.getMonth(),
       this.today.getDate() - 30
     );
     toDate: any = this.today;
    
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient,
 private excelService: ExcelService) { }


  clearFilter() {
    // this.filterDepartment = '';
    this.filterPayGroup = '';
    this.filterPurpose = '';
    this.filterTypeOfGuest = '';
    this.filtertypeOfEvent = '';
    this.filterInvoiceDate;
    this.filterEventDate = '';
    this.filterVendorName = '';
    this.Amount = null;
    this.filterDashboard = '';

  }

  
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

  TypeOfGuestList: any[] = [];
  getTypeOfGuestList() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_GET_TYPE_OF_GUEST).then((data: any) => {
      if (data.length > 0) {
        this.TypeOfGuestList = data;
      }
      // this.reInitDatatable();
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
  setDe(mtr) {
    this.isLoading = true;

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

  


  payGroupList: any[] = [];
  getpayGroupList() {
    this.errMsg = "";
    this.get("PayGroupMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.payGroupList = data.sort((a, b) => {
          if (a.short_desc > b.short_desc) return 1;
          if (a.short_desc < b.short_desc) return -1;
          return 0;
        });

      }
    }).catch(error => {
      this.isLoading = false;
      this.payGroupList = [];
    });
  }

  // getdepartmentList() {
  //   this.errMsg = "";
  //   this.get("DepartmentMaster/GetAll").then((data: any) => {
  //     if (data.length > 0) {
  //       this.departmentList = data.filter(x => x.isActive).sort((a, b) => {
  //         if (a.name > b.name) return 1;
  //         if (a.name < b.name) return -1;
  //         return 0;
  //       });
  //     }
  //   }).catch(error => {
  //     this.departmentList = [];
  //     this.isLoading = false;

  //   });
  // }


  getFilteredList() {
    if (this.filterPayGroup == null) {
      alert("Please select Divison.");
      return;
    }
    else if (this.filterType == 0 && this.filterTypeOfGuest == null) {
      alert("Please select Type Of Guest.");
      return;
    }
    else {
      let filterModel: any = {};
      filterModel.createdBy = this.currentUser.employeeId;
      filterModel.vendorName = this.filterVendorName;
      filterModel.invoiceDate = this.setDateFormate(this.filterInvoiceDate);
      filterModel.fromDate = this.setDateFormate(this.fromDate);
      filterModel.toDate = this.setDateFormate(this.toDate);
      filterModel.eventDate = this.setDateFormate(this.filterEventDate);
      filterModel.amount = this.Amount;
      filterModel.division = this.filterPayGroup;
      filterModel.typeOfEvent = this.filtertypeOfEvent;
      // filterModel.department = this.filterDepartment
      filterModel.typeOfGuest = this.filterTypeOfGuest;
      let connection = this.httpService.post(APIURLS.BR_POST_TRAVEL_EXPENSE, filterModel);
      connection.then((data: any) => {
        if (data) {
          if (data.type == 'E') {
            alert(data.message);
            this.clearFilter();
            return;
          }
          else {
            this.ExpenseUpdate = data;
          }
        }
        this.clearFilter();
      }).catch(error => {
        this.errMsgPop = 'Error saving Expense Update ..';
      });
    }
  }
    
   ngOnInit() {
      this.path = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.getTypeOfGuestList();
      // this.getdepartmentList();
      this.getTypeOfEventList();
      this.getpayGroupList();
      this.getVendorMasterList()
      this.filterDashboard;
       let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
       this.roleId = authData.roleId;
       this.usrid = authData.uid;
       this.employeeId = authData.userName;
     }
     else
       this.router.navigate(["/unauthorized"]);
   }
 
 
  
 
   getFormatedDate(date: any): string {
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear();
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
    return (d1.getFullYear() + '-' + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" + ("00" + d1.getDate()).slice(-2));
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
dashboard:any;
checkedRequestList: any[] = [];
Dashamount: any[] = [];
Dashlabels: any[] = [];
  Submit(){
        let Model: any = {};
        if(this.filterPayGroup != null && this.filterPayGroup != "")
        {     
          Model.division = this.filterPayGroup[0]['short_desc'];
        }
            
        if(this.filterVendorName != null && this.filterVendorName != "")
        {
          Model.vendorName = this.filterVendorName[0]['name'];
        } 
        // if(this.filterDepartment != null && this.filterDepartment != "")
        // {
        //   Model.department = this.filterDepartment[0]['name'];
        // } 
      
        Model.eventDate = this.filterEventDate;
        Model.typeOfGuest = this.filterTypeOfGuest;
        Model.typeOfEvent = this.filtertypeOfEvent;
        Model.purpose = this.filterPurpose;
        Model.invoiceDate = this.filterInvoiceDate;
        Model.dashboard = this.filterDashboard;
        Model.fromDate = this.fromDate;
        Model.toDate = this.toDate;
        let connection = this.httpService.post(APIURLS.BR_GET_DASHBOARD, Model);
        connection.then((data: any) => {
          if (data) {
            if (data.type == 'E') {
              alert(data.message);
              return;
            }
            else {
             this.checkedRequestList=data;
             this.Dashlabels = [];
             this.Dashamount = [];
             this.checkedRequestList.forEach(element => {
              this.Dashlabels.push(element.labels);
    this.Dashamount.push(element.amount);
              });

            
             this.showChart();
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

   getHeader(): any {
let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
        const headers = new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authData.token
        });
        return { headers: headers };
}

  showChart() {
    if (this.chart) this.chart.destroy();
    this.chart = new Chart('lineCharts', {
      type: 'bar',
      data: {
      labels: this.Dashlabels, // your labels array
      datasets: [
        {
          label: '# Expense',
          data: this.Dashamount, // your data array
          backgroundColor: [
           'rgba(54, 162, 235, 1)',
           'rgba(255, 99, 132, 1)',
           'rgba(255, 206, 86, 1)',
           'rgba(75, 192, 192, 1)',
           'rgba(153, 102, 255, 1)',
           'rgba(230, 25, 75, 1)',
           'rgba(60, 180, 75, 1)',
           'rgba(245, 130, 48, 1)',
           'rgba(145, 30, 180, 1)',
           'rgba(210, 245, 60, 1)',
           'rgba(0, 128, 128, 1)',
           'rgba(128, 0, 0, 1)'

          ],
          fill:true,
          lineTension:0.2,
          borderWidth: 0.5
        }
      ]
      },
      options: {
        responsive: true,
        title: {
        text:this.filterDashboard + " wise graph from " + this.getFormatedDate(this.fromDate)  + " to " + this.getFormatedDate(this.toDate) + ".",
        display:true
        },
        scales: {
          yAxes:[{
            ticks:{
              beginAtZero:true
            }
          }]
        }
      }
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
    textField: 'short_desc',
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

}





