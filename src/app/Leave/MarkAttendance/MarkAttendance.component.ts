import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';
import { MarkAttendance } from './MarkAttendance.model';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { FormControl, NgForm } from '@angular/forms';
import { AuthData } from '../../auth/auth.model';
import swal from 'sweetalert';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as _ from "lodash";
declare var jQuery: any;
export class actionItemModel {
  description: string
  id!: number;
  uname: string
}
@Component({
  selector: 'app-MarkAttendance',
  templateUrl: './MarkAttendance.component.html',
  styleUrls: ['./MarkAttendance.component.css']
})
export class MarkAttendancecomponent implements OnInit {
  searchTerm: FormControl = new FormControl();
@ViewChild(NgForm, { static: false }) leaveForm!: NgForm;

  public tableWidget: any;
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  path: string = '';
  notFirst = true;
  currentUser = {} as AuthData;
  auditType: string// set ActionTypes: Create,Update,Delete
  aduitpurpose: string
  id: any;
  locationAllList: any;
  locationList: any[] = [];
  locListCon: any;
  leaveList: any;
  checkdup: any[] = [];
  CompOtRulesList: any;
  filtermonth: any;
  filterYear: any;

  constructor(private httpService: HttpService, private router: Router, private appService: AppComponent,
    private http: HttpClient) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#LeaveReasonTable');
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


  ngOnInit() {
    this.path = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.getempCatList();
      this.getplantMaster();
      this.getpayGroupList();
      this.yearslist();

    }
    else
      this.router.navigate(["/unauthorized"]);
  }


  getPlantname(id:any) {
    let temp = this.locationList.find((x:any)  => x.id == id);
    return temp ? temp.code : '';
  }

  getPaygroupname(id:any) {
    let temp = this.payGroupList.find((x:any)  => x.id == id);
    return temp ? temp.short_desc : '';
  }

  getStaffcatname(id:any) {
    let temp = this.empCatList.find((x:any)  => x.id == id);
    return temp ? temp.catltxt : '';
  }

  ngAfterViewInit() {
    this.initDatatable()
  }

  closeSaveModal() {
    jQuery("#myModal").modal('hide');
  }
  
  payGroupList: any[] = [];
  getpayGroupList() {
    this.errMsg = "";
    this.get("PayGroupMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.payGroupList = data.sort((a:any, b:any) => {
          if (a.short_desc > b.short_desc) return 1;
          if (a.short_desc < b.short_desc) return -1;
          return 0;
        });
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.payGroupList = [];
    });
  }

  empCatList: any[] = [];
  getempCatList() {
    this.errMsg = "";
    this.get("EmployeeCategoryMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.empCatList = data;
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.empCatList = [];
    });
  }

  getplantMaster() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationAllList = data;
        this.locationList = data.filter((x:any)  => x.isActive);
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
        this.locListCon = data.map((x:any) => { x.name1 = x.code + '-' + x.name; return x; });
        this.locListCon.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.locationList = [];
    });
  }

  get(apiKey: string): any {
    const promise = new Promise((resolve, reject) => {
      this.http.get("http://192.168.1.134:8080/api/api/" + apiKey, this.getHeader())
        .toPromise()
        .then(
          res => {
            resolve(res);
          },
          err => {
            reject(err.json());
          }
        );

    });
    return promise;
  }

getHeader(): { headers: HttpHeaders } {
  //let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
let authData: AuthData = JSON.parse(localStorage.getItem('currentUser') || '{}');

  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authData.token
  });

  return { headers };
}
  
  Monthlist: any[] = [
    { id: 1, name: 'January' },
    { id: 2, name: 'February' },
    { id: 3, name: 'March' },
    { id: 4, name: 'April' },
    { id: 5, name: 'May' },
    { id: 6, name: 'June' },
    { id: 7, name: 'July' },
    { id: 8, name: 'August' },
    { id: 9, name: 'September' },
    { id: 10, name: 'October' },
    { id: 11, name: 'November' },
    { id: 12, name: 'Decemeber' }
  ];

  YearList: any[] = [];
  yearslist() {
    let today = new Date();
    for (let i = 0; i < 2; i++) {
      let model: any = {};

      model.year = new Date(today.getFullYear() - i, today.getMonth(), today.getDate())
      this.YearList.push(model)
    }
  }

  getEmpAtt() {
    if (this.filtermonth == null) {
      alert("Please select Month !")
    }
    else if (this.filterYear == null) {
      alert("Please select Year !")
    }

    let srchstr: any = {};
    srchstr.Month = this.filtermonth;
    srchstr.Year = this.filterYear;


  }

  clearFilter() {
    this.filterYear = null;
    this.filtermonth = null;
  }

  getEmpReq() {
    
  }


}
