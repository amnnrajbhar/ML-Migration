import { AuthData } from '../../auth/auth.model';
import { APIURLS } from '../../shared/api-url';
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
 
import { map, catchError, debounceTime, switchMap } from 'rxjs/operators';

declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { Router } from '@angular/router';
import { debug } from 'util';
import { FormControl, NgForm } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

import swal from 'sweetalert';
import { ExcelService } from '../../shared/excel-service';
import { ExpenseUpdate } from './ExpenseUpdate.model';
import { stringify } from 'querystring';


@Component({
  selector: 'app-ExpenseUpdate',
  templateUrl: './ExpenseUpdate.component.html',
  styleUrls: ['./ExpenseUpdate.component.css']
})
export class ExpenseUpdateComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger: MatAutocompleteTrigger;
@ViewChild(NgForm, { static: false }) userForm: NgForm;

  @ViewChild('myInput', { static: false }) myInputVariable: ElementRef;

  public tableWidget: any;
  // departmentList: any[] = [];
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  errMsgPop: string = "";  
  isEdit: boolean = false;
  path: string;
  filterEmployeeName: string = null;
  filterLocation: string = null;
  typeOfGuestList: any;
  filterPayGroup: string = null;
  filterInvoiceNo: number = null;
  filterVendorName: string = null;
  filterVendorCity: string = null;
  Amount: number = null;
  filterCheckInFavourOf: string = null;
  filterNoOfPax: string = null;
  filterhotel:string = null;
  filterRemarks: string = null;
  // filterDepartment: string = null;
  filterTypeOfGuest: string = null;
  filterExpenseCategory: string = null;
  filterStatus: number = 1;
  filterType: any = null;
  filterEmployeeNo: string;
  filterGender: string;
  userList: any;
  empListCon: any;
  VendorMasterList: any;
  vendorListCon: any;
  filterEventDate: string;
  filterInvoiceDate: string;
  ExpenseUpdate: any;
  CreatedBy: any;
  isSubmitting: boolean;
  filtertypeOfEvent: string;
  filtername: string;
  filterSupportings:string;
  errorlist: string;
  VendorMasterList1: any[]=[];

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient, private excelService: ExcelService) { }


  clearFilter() {
    this.filterLocation = this.currentUser.baselocation.toString();
    this.filterEmployeeName = '';
    this.filterEmployeeNo = '';
    this.filterGender = '';
    // this.filterDepartment = '';
    this.filterPayGroup = '';
    this.filtertypeOfEvent = '';
    this.filterTypeOfGuest = '';
    this.filterType= '';
    this.filterType = null;
    this.filterInvoiceNo = null;
    this.filterEventDate = '';
    this.filterInvoiceDate = '';
    this.filterVendorName = '';
    this.filterVendorCity = '';
    this.Amount = null;
    this.filterCheckInFavourOf = '';
    this.filterNoOfPax = null;
    this.filterhotel = null;
    this.filterRemarks = '';
    this.filtername='';
    this.filterSupportings='';

  }


  currentUser = {} as AuthData;
  ngOnInit() {
    this.path = this.router.url;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.filterLocation = this.currentUser.baselocation.toString();
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.getTypeOfGuestList();
      // this.getdepartmentList();
      this.getTypeOfEventList();
      // this.getExpenseCategoryList();
      this.getpayGroupList();
      // this.getPurposeList();
      //  this.getUserMasterList();
      this.getVendorMasterList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

 formData: FormData = new FormData();
  file:File;
   uploadfiles(files:File)
   {
      // this.id='VM001';
        this.file=files[0];
   }

   TravelExpenseUpload:any[]=[];
  upload():any
  {     
    let connection: any; 
    this.isSubmitting = true;    
     this.isLoading=true;
     this.formData =  new  FormData();
     this.formData.append('file',this.file);
    connection = this.httpService.ExcelUpload(APIURLS.BR_UPLOAD_EXCELFILE_TX,this.currentUser.employeeId,this.formData);
    connection.then((data: any) => {
      if(data){
        if (data[0].type == 'E') {
           this.isLoading=false;
          this.errorlist = 'Error List';
          data.forEach(element => {
            this.errorlist = this.errorlist + '\n' + element.message;  
            });
          alert(this.errorlist);
          this.reset();
          return;
        }
        else {
           this.isLoading=false;          
          swal({
            title: "Message",
            text: "Excel uploaded successfully.",
            icon: "success",
            dangerMode: false,
            buttons: [false, true]
          });
        }
        this.reset();
      }
    }).catch(error => {
        this.isLoading=false;
      this.errMsgPop = 'Error uploading file ..';
    });
  }

  reset() {
    console.log(this.myInputVariable.nativeElement.files);

    if (this.myInputVariable.nativeElement.value != null || this.myInputVariable.nativeElement.value != undefined) {
      this.myInputVariable.nativeElement.value = "";
    }

    console.log(this.myInputVariable.nativeElement.files);
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

  getUserMasterListByIdFilter(id:string) {
    this.errMsg = "";
     this.isLoading = true;
    this.httpService.getByParam(APIURLS.BR_EMPLOYEEMASTER_ACTIVE_API_GET_BY_ID,id).then((data: any) => {
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
    if (mtrl.length>=3) {
      this.getUserMasterListByIdFilter(mtrl);
    }else{
      this.empListCon=[];
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

  getUserMasterListByIdFilter1(mtrl:string) {
    this.errMsg = "";
      this.isLoading = true;
    this.httpService.getByParam(APIURLS.BR_EMPLOYEEMASTER_ACTIVE_API_GET_BY_NAME,mtrl).then((data: any) => {
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
    if (mtrl.length>=3) {
      this.getUserMasterListByIdFilter1(mtrl);
    }else{
      this.empListCon=[];
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

    
  getVendorMasterList() {
    this.errMsg = "";
     this.isLoading = true;
    this.httpService.get(APIURLS.BR_GET_TDVENDOR_DETAILS_API).then((data: any) => {
      if (data.length > 0) {
        this.VendorMasterList1 = data;
        this.VendorMasterList = this.VendorMasterList1.filter(x=> x.isActive == true);
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
  // setDe(mtr) {
  //   this.isLoading = true;
  //   this.filterVendorCity = this.VendorMasterList.find(x => x.name == mtr).city;
  // }



  // ExpenseCategoryList: any[] = [];
  // getExpenseCategoryList() {
  //   this.isLoading = true;
  //   this.httpService.get(APIURLS.BR_GET_EXPENSE_CATEGORY).then((data: any) => {
  //     if (data.length > 0) {
  //       this.ExpenseCategoryList = data;
  //     }
  //     // this.reInitDatatable();
  //     this.isLoadingPop = false;
  //   }).catch((_error: any) => {
  //     this.isLoading = false;

  //   });
  // }

  TypeOfEventList: any[] = [];
  TypeOfEventList1: any[] = [];
  getTypeOfEventList() {
     this.isLoading = true;
    this.httpService.get(APIURLS.BR_GET_TYPEOFEVENT).then((data: any) => {
      if (data.length > 0) {
        this.TypeOfEventList1 = data;
        this.TypeOfEventList = this.TypeOfEventList1.filter(x=> x.isActive == true);
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

  onItemDeSelect(item: any) {
  }
  onDeSelectAll(items: any) {
  }
  // onSelect(items: any) {
  //   this.isLoading = true;
  //   this.filterVendorCity = this.VendorMasterList.find(x => x.name == this.filterVendorName[0]['name']).city;
  // }
  dropdownSettings = {
    singleSelection: true,
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
      if(this.filterPayGroup != null && this.filterPayGroup != "")
      {     
        filterModel.division = this.filterPayGroup[0]['long_Desc'];
      }
          
      if(this.filterVendorName != null && this.filterVendorName != "")
      {
        filterModel.vendorName = this.filterVendorName[0]['name'];
      } 
      // if(this.filterDepartment != null && this.filterDepartment != "")
      // {
      //   filterModel.department = this.filterDepartment[0]['name'];
      // } 
      filterModel.createdBy = this.currentUser.employeeId;
      filterModel.vendorCity = this.filterVendorCity;
      // filterModel.vendorName = this.filterVendorName[0]['name'];
      filterModel.invoiceNo = this.filterInvoiceNo;
      filterModel.invoiceDate = this.setDateFormate(this.filterInvoiceDate);
      filterModel.eventDate = this.setDateFormate(this.filterEventDate);
      filterModel.gender = this.filterGender;
      filterModel.amount = this.Amount;
      filterModel.checkInFavourOf = this.filterCheckInFavourOf;
      filterModel.noOfPax = this.filterNoOfPax;
      filterModel.hotelName = this.filterhotel;
      filterModel.name = this.filtername;
      filterModel.remarks = this.filterRemarks;
      filterModel.supportings = this.filterSupportings;
      //  filterModel.division = this.filterPayGroup[0]['long_Desc'];
      filterModel.typeOfEvent = this.filtertypeOfEvent;
      // filterModel.department = this.filterDepartment[0]['name'];
      filterModel.typeOfGuest = this.filterTypeOfGuest;
      // filterModel.purpose = this.filterPurpose;
      filterModel.employeeId = this.filterEmployeeNo;
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
            swal({
              title: "Message",
              text: "Expense details submitted successfully.",
              icon: "success",
              dangerMode: false,
              buttons: [false, true]
            });
          }
        }
        this.clearFilter();
      }).catch(error => {
        this.errMsgPop = 'Error saving Expense Update ..';
      });
    }
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
 
getHeader(): { headers: HttpHeaders } {
  let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));

  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authData.token
  });

  return { headers };
}

}

