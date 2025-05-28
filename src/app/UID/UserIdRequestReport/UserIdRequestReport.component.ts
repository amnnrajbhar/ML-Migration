import { Component, OnInit, Inject, LOCALE_ID, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
declare var jQuery: any;
import * as _ from "lodash";
import swal from 'sweetalert';
import { AppService } from '../../shared/app.service';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';

import {  MonthView, GetMonthViewArgs } from 'calendar-utils';
//import { Visitor } from './visitor.model';
import { AuthData } from '../../auth/auth.model';
import { FormControl, NgForm } from '@angular/forms';
import { colors } from '../../shared/colors';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

import { UserIdRequest } from '../../UID/UserIdRequest/UserIdRequest.model';
import { Transactions } from '../../eMicro/ItemCodeCreation/transactions.model';
import { WorkFlowApprovers } from '../../eMicro/Masters/WorkFlowApprovers/WorkFlowApprovers.model';
import { AppComponent } from '../../app.component';
import { Router } from '@angular/router';
import { ExcelService } from '../../shared/excel-service';
import { HttpClient } from '@angular/common/http';
// import * as pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
// import htmlToPdfmake from 'html-to-pdfmake';


interface task {
  value: string
  viewValue: string
}

interface taskGroup {
  disabled?: boolean;
  name: string
  task: task[];
}

interface UGrpsList 
{id:number ,UserGroup:string , sid:number , UserSubGroups:any[]}


@Component({
  selector: 'app-UserIdRequestReport',
  templateUrl: './UserIdRequestReport.component.html',
  styleUrls: ['./UserIdRequestReport.component.css'],

})
export class UserIdRequestReportComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger!: MatAutocompleteTrigger;

  @ViewChild('myInput', { static: false }) myInputVariable!: ElementRef;


  searchTermBaseLoc = new FormControl();
  public filteredItemsBaseLoc = [];
  searchTermMgr = new FormControl();
  public filteredItemsMgr = [];
  searchTermRMgr = new FormControl();
  public filteredItemsRMgr = [];
  public tableWidget: any;

  locListCon = [];
  locListCon1 = [];

  isLoading: boolean = false;
  errMsg: string = "";
  errMsg1: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;

  formData: FormData = new FormData();
  file!: File; successMsg: string = "";
  path: string = '';
  locationList: any[] = [[]];
  selectedBaseLocation: any = [];
  baseLocationnotfirst = true;


  userIdRequest = {} as UserIdRequest
  userIdRequestlist: UserIdRequest[] = [];
  // ItemCodeExtensionlist:ItemCodeExtension[]=[];
  materialtype!: string
  comments: string
  filterMaterialCode: string = ' ';
  filterstatus: string = ' ';
  filtersoftware: string = ' ';
  filterrequest: string = ' ';
  filterType: string = ' ';
  filterEmployee:string=null;
  filterlocation:string=null;
  filterEquipName:string=null;
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  //ItemCodeExtensionFilter:ItemCodeExtension[]=[];

  UserIdRequestList: UserIdRequest[] = [];
  userIdRequestsearchlist: UserIdRequest[] = [];

  emailid!: string

  requestdate: any;
  Approver1: boolean = false;
  Approverid1: string = "";
  Approverid2: string = "";
  Approver2: boolean = false;
  Creator: boolean = false;
  Review: boolean = false;
  Closure: boolean = false;
  userid: string
  UserIdRequestist: UserIdRequest[] = [];

  storeData: any;
  jsonData: any;
  fileUploaded!: File;
  worksheet: any;
  requestfor: any;
  selectedSoftwares: any[] = [];
  //userIdRequestmodeldata = {} as ItemCodeExtension;

    //new Dev
    softType: string
    locationCode: string
    filteredSoftwareList: any[] = [];
    Software: string = ' ';
    ReportType:string=null;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router
    , private http: HttpClient, private excelService: ExcelService, private datePipe:DatePipe) {
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
 }

  private initDatatable(): void {
    let exampleId: any = jQuery('#userTable');
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
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    //  this.baseLocation = this.currentUser.baselocation;
    this.emailid = this.currentUser.email;
    this.userid = this.currentUser.employeeId;
    this.requestdate = new Date(this.today);
    //this.filterstatus = 'Pending';
    //this.filterlocation = this.currentUser.baselocation.toString();
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {

     // this.getAllEntries();
     this.getPlantsassigned(this.currentUser.fkEmpId);
      this.getLocationMaster();
      this.getSoftwareModulesList();
      this.getSoftwareUserProfilesList();
      this.getUserGroupsMasterList();
    //  this.getUserSubGroupsMasterList();
      this.getRepositoryDomainsList();
      this.getsoftwareMasterList();
      this.getDepartList();
     // this.getlist();
      this.getbase64image();
      this.getsoftwareRolesMasterList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }
  locationAllList: any[] = [[]];
  getLocation(id:any) {
    let temp = this.locationAllList.find(e => e.id == id);
    return temp ? temp.code : '';
  }
  getloc(loc:any) {
    let loccode = loc.keyValue.split('~');
    return loccode ? loccode[0] : '';
  }

  dropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  dropdownSettingsRO = {
    singleSelection: false,
    idField: 'id',
    textField: 'role',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  dropdownSettingsL = {
    singleSelection: false,
    idField: 'id',
    textField: 'name1',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  dropdownSettingsM= {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  }
  dropdownSettingsR = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  dropdownSettingsUM={
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  }
  dropdownSettingsU = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  dropdownSettingsP={
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  }
  onItemSelect(item: any) {
    // debugger;

  }
  onItemDeSelect(item: any) {
    // debugger;
    //  console.log(item);

  }
  onSelectAll(items: any) {
    //debugger;
    //  console.log(items);

  }
  onDeSelectAll(items: any) {

  }
  onSelectRoom(item: any) {
    //console.log(item);
    this.userIdRequest.sid = item.id;
    this.getApproversList(this.userIdRequest);
  }
  sid!: number;
  isActiveTab(idx: number, selectedRoom: any) {
    if (this.sid != 0)
      return this.sid === selectedRoom.id;
    return idx === 0;
  }

  statuslist: any[] = [
    { id: 1, name: 'Created' },
    { id: 2, name: 'Submitted' },
    { id: 3, name: 'Pending' },
    { id: 4, name: 'Rejected' },
    { id: 5, name: 'Completed' },
    { id: 6, name: 'InProcess' }
  ];
  mastersList: any[] = [
    { id: 1, name: 'FRM' },
    { id: 2, name: 'FROM' },
    { id: 3, name: 'ARDM' },
    { id: 4, name: 'APIM' },
    { id: 5, name: 'NA'}
  ];

  approverstatuslist: any[] = [
    { id: 1, name: 'Reviewed' },
    { id: 2, name: 'Reviewed' },
    { id: 3, name: 'Reviewed' },
    { id: 4, name: 'Approved' },
    { id: 5, name: 'Approved' },
    { id: 6, name: 'Created' },
    { id: 7, name: 'Closed' }
  ];

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }
  getFormatedDateTime(date: any) {
    let dt = new Date(date);
    let formateddate = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
      ("00" + dt.getDate()).slice(-2) + ' ' +
      ("00" + dt.getHours()).slice(-2) + ":" +
      ("00" + dt.getMinutes()).slice(-2) + ":" +
      ("00" + dt.getSeconds()).slice(-2);
    return formateddate;
  }


  clearFilter() {
    this.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    this.to_date = this.today;
    this.filtersoftware = null;
  // this.filterstatus = null;
  this.filterstatus = '';
    this.filterrequest = null;
    //this.filterType = null;
this.filterType = '';
    this.filterEmployee=null;
    this.filterlocation=null;
    this.filterEquipName=null;
    this.ReportType=null;

  }
  plantAssignedList: any[] = [];
  getPlantsassigned(id:any) {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.plantAssignedList = data;
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.plantAssignedList.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.plantAssignedList = [];
    });
  }


  location(id:any) {
    let loc = this.locationList.find((x:any)  => x.id == id);
    return loc ? loc.code : "";
  }

 
  getAllEntries() {
    this.isLoading = true;
    let td = new Date();
    let formatedFROMdate: string
    let formatedTOdate: string
    var filterModel: any = {};
    filterModel.location = this.filterlocation;
    filterModel.requestNo = this.filterrequest;
    filterModel.software = this.filtersoftware;
    filterModel.status = this.filterstatus;
    filterModel.type = this.filterType;
    filterModel.equipmentId = this.filterEmployee;
    filterModel.creator = this.currentUser.employeeId;
    filterModel.pageNo = this.pageNo;
    filterModel.pageSize = this.pageSize;
    filterModel.reportType ="Report";
    filterModel.fromDate = this.from_date ? this.getFormatedDateTime(this.from_date) : null;
    filterModel.toDate = this.to_date ? this.getFormatedDateTime(this.to_date) : null;
    this.httpService.post(APIURLS.BR_USERID_REQUESTS_FILTER_API, filterModel).then((data: any) => {
      if (data) {
        
        this.totalCount = data[0].totalCount;
          this.totalPages = data[0].totalPages;
          this.UserIdRequestList = data;
          this.getSummarydata(data);
       // }
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.UserIdRequestList = [];
    });

  }


  UserIdRequestList1:UserIdRequest[]=[];
  ExportData(value)
  {
    this.isLoading = true;
    let td = new Date();
    let formatedFROMdate: string
    let formatedTOdate: string
    var filterModel: any = {};
    filterModel.location = this.filterlocation;
    filterModel.requestNo = this.filterrequest;
    filterModel.software = this.filtersoftware;
    filterModel.status = this.filterstatus;
    filterModel.type = this.filterType;
    filterModel.equipmentId = this.filterEquipName;
    filterModel.creator = this.currentUser.employeeId;
    filterModel.export = true;
    filterModel.fromDate = this.from_date ? this.getFormatedDateTime(this.from_date) : null;
    filterModel.toDate = this.to_date ? this.getFormatedDateTime(this.to_date) : null;
    this.httpService.post(APIURLS.BR_USERID_REQUESTS_FILTER_API, filterModel).then((data: any) => {
      if (data.length>0) {

        this.UserIdRequestList1=data;
        swal({
          title: "Message",
          text: "Are you sure to export..?",
          icon: "info",
          dangerMode: false,
          buttons: [true, true]
        }).then((willDelete) => {
          if (willDelete) {
            if(value =='Excel')
            {
              this.export();
            }
            else{
              this.downloadPdf();
            }
          }
        });
       
        
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.UserIdRequestList = [];
    });

  }

  export(){
    var exportList=[];
    let index=0;
    this.UserIdRequestList1.forEach((item :any) => {
      index=index+1;
      let exportItem={
        "SNo":index,
        "Request No": item.requestNo,
        "Requested By": item.requesterId,
        "Request Date": this.datePipe.transform(item.createdDate,'dd/MM/yyyy HH:mm'),
        "OnBehalf EmpId": item.onBehalfEmp,
        "Software type": item.softwareType,
        "Software": this.getsoft(item.sid),
        "Request Type": item.requestType,
        "Role":  item.softwareType=='Plant Level'?this.getrole(item.generalRole):this.getrole(item.newRoleInQams),
        "UserId Status": item.isActive==false?'InActive':'Active',
        "Plant": this.getLocation(item.locationId),
        "Request Status": item.status,
        "UserId": item.allottedUserId,
        "Last Approver": item.lastApprover,
        "Pending Approver": item.pendingApprover,
      };
        exportList.push(exportItem);
    });
    this.excelService.exportAsExcelFile(exportList, 'UserIdRequestList');
  }
  
  setDateFormate(date: any): string {
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear() +' ' +
      ("00" + d1.getHours()).slice(-2) + ":" +
      ("00" + d1.getMinutes()).slice(-2) + ":" +
      ("00" + d1.getSeconds()).slice(-2);
  }

 pageSize: any = 10;
  pageNo: any;
  totalCount!: number;
  totalPages: number
  gotoPage(no) {
    if (this.pageNo == no) return;
    this.pageNo = no;
    this.getAllEntries();
  }

  pageSizeChange() {
    this.pageNo = 1;
    this.getAllEntries();
  }
  getlist() {
    if(this.ReportType ==null || this.ReportType == undefined)
    {
      alert("Please select report type..!")
      return;
    }
    else{
      this.pageNo = 1
      this.getAllEntries();
    }
   
  }
  summarylist: any[] = [{ id: 0, type: '', Created: null, Submitted: null, InProcess: null, rejected: null, Completed: null, Total: null }]
  getSummarydata(data) {
    this.summarylist = [];
    var softwareList1=[]
    if(this.filtersoftware !=null)
    {
      softwareList1=this.softwareList.filter((x:any)=>x.id==this.filtersoftware);
    }
    else
    {
      softwareList1=this.softwareList;
    }    
    softwareList1.forEach((element:any)=> {

      let newSummary = { id: 0, type: '', Created: null, Submitted: null, InProcess: null, rejected: null, Completed: null, Total: null };
      newSummary.type = element.name ;
      let cre = data.filter((x:any)  => x.sid == element.id && x.status == 'Created');
      newSummary.Created = cre.length;
      let sub = data.filter((x:any)  => x.sid == element.id && x.status == 'Submitted');
      newSummary.Submitted = sub.length ;
      let inp = data.filter((x:any)  => x.sid == element.id && x.status == 'InProcess');
      newSummary.InProcess = inp.length ;
      let rej = data.filter((x:any)  => x.sid == element.id && x.status == 'Rejected');
      newSummary.rejected = rej.length;
      let com = data.filter((x:any)  => x.sid == element.id && x.status == 'Completed');
      newSummary.Completed = com.length;
      let tot = data.filter((x:any)  => x.sid == element.id && x.status != 'Created');
      newSummary.Total = cre.length + sub.length + inp.length + rej.length + com.length ;
      this.summarylist.push(newSummary);
    });
    this.gettotal(this.summarylist);
  }
  totcre: any;
  totsub: any;
  totinp: any;
  totrej: any;
  totcom: any;
  total: any;
  gettotal(value) {
    this.total = 0;
    this.totcre = 0;
    this.totsub = 0;
    this.totinp = 0;
    this.totrej = 0;
    this.totcom = 0;
    for (let j = 0; j < value.length; j++) {
      this.total += value[j].Total;
      this.totcre += value[j].Created;
      this.totsub += value[j].Submitted;
      this.totinp += value[j].InProcess;
      this.totrej += value[j].rejected;
      this.totcom += value[j].Completed;

    }

  }
  getLocationMaster() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationAllList = data;
        this.locationList = data.filter((x:any)  => x.isActive);
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
        this.locListCon = data.map((x:any) => { x.name1 = x.code + '-' + x.name; return x; });
        this.locListCon.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
        this.locationId = this.locListCon.find((x:any)  => x.id == this.currentUser.baselocation).name1
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.locationList = [];
    });
  }
  RepositoryDomainsList: any[] = [];
  getRepositoryDomainsList() {
    this.errMsg = "";
    this.isLoading = true;
    //this.RepositoryDomainsList=[];
    this.httpService.get(APIURLS.BR_REPOSITORY_DOMAINS_API).then((data: any) => {
      if (data.length > 0) {
        this.RepositoryDomainsList = data;
      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.RepositoryDomainsList = [];
    });
  }
  softwareList: any[] = [];
  getsoftwareMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    //this.softwareList=[];
    this.httpService.get(APIURLS.BR_SOFTWARE_API).then((data: any) => {
      if (data.length > 0) {
        this.softwareList = data.filter((x:any)  => x.isActive).sort((a:any, b:any) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.softwareList = [];
    });
  }
  SoftwareModulesList: any[] = [];
  getSoftwareModulesList() {
    this.errMsg = "";
    this.isLoading = true;
    //this.SoftwareModulesList=[];
    this.httpService.get(APIURLS.BR_SOFTWARE_MODULES_API).then((data: any) => {
      if (data.length > 0) {
        this.SoftwareModulesList = data;
      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.SoftwareModulesList = [];
    });
  }
  softwareUserProfilesList: any[] = [];
  getSoftwareUserProfilesList() {
    this.errMsg = "";
    this.isLoading = true;
    //this.softwareUserProfilesList=[];
    this.httpService.get(APIURLS.BR_SOFTWARE_USER_PROFILES_API).then((data: any) => {
      if (data.length > 0) {
        this.softwareUserProfilesList = data.filter((x:any)  => x.isActive).sort((a:any, b:any) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.softwareUserProfilesList = [];
    });
  }
  softwareRolesList: any[] = [];
  softwareRolesList1: any[] = [];
  getsoftwareRolesMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    //this.softwareRolesList=[];
    this.httpService.get(APIURLS.BR_SOFTWARE_ROLES_API).then((data: any) => {
      if (data.length > 0) {
        this.softwareRolesList = data.filter((x:any)  => x.isActive).sort((a:any, b:any) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.softwareRolesList = [];
    });
  }
  UserGroupsList: any[] = [];
  UserGroupsList1: any[] = [];
  getUserGroupsMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    //this.UserGroupsList=[];
    this.httpService.get(APIURLS.BR_USER_GROUPS_API).then((data: any) => {
      if (data.length > 0) {
        this.UserGroupsList = data;
        this.getUserSubGroupsMasterList();
      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.UserGroupsList = [];
    });
  }
  DepartmentList:any[]=[];
  getDepartList() {
     
    this.httpService.get(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      this.isLoading = false;
      if (data.length >0) {
        this.DepartmentList = data.filter((x:any)  => x.isActive).sort((a:any,b:any)=>{
          if(a.name > b.name) return 1;
          if(a.name < b.name) return -1;
          return 0;
        });
     
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.DepartmentList = [];
    });
  }
  UserSubGroupsList: any[] = [];
  UserSubGroupsListCon: any[] = [];
  UserSubGroupsList1: any[] = [];
  
  usergroupsList:any[]=[];
  usergroupsList1:any[]=[];
  getUserSubGroupsMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    //this.UserSubGroupsList=[];
    this.httpService.get(APIURLS.BR_USER_SUB_GROUPS_API).then((data: any) => {
      if (data.length > 0) {
        this.UserSubGroupsList = data;

        this.UserGroupsList.forEach((element:any)=> {

          let groups= {} as UGrpsList;
          groups.UserGroup=element.name;
          groups.sid=element.fkSoftwareId;
          let temp=this.UserSubGroupsList.filter((x:any)=>x.fkUserGroupId==element.id);
          groups.UserSubGroups=temp;
          this.usergroupsList.push(groups);
        });


      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.UserSubGroupsList = [];
    });
  }

 

  currentUser!: AuthData;
  ngAfterViewInit() {
    this.initDatatable();
  }
  getsoft(id:any) {
    let temp = this.softwareList.find((x:any)  => x.id == id);
    return temp ? temp.name : '';
  }
  getrole(id:any) {
    let temp = this.softwareRolesList.find((x:any)  => x.id == id);
    return temp ? temp.role : '';
  }
 
  locationId: any;

  transactionslist: Transactions[] = [];
  transactionslist1: Transactions[] = [];
  gettransactions(reqNo) {
    this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_GETBY_PARAM_API, reqNo).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.transactionslist = data;
        //this.transactionslist.reverse();
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.transactionslist = [];
    });

  }

  gettransactionsHistory(reqNo) {
    this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_HISTORY_API, reqNo).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.transactionslist1 = data;
        //this.transactionslist.reverse();
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.transactionslist1 = [];
    });

  }
  Approverslist: WorkFlowApprovers[] = [];
  accountGroupList: any[] = [];
  Aprlpriority!: number;
  getroleslist(id:any) {
    this.softwareRolesList1 = this.softwareRolesList.filter((x:any)  => x.sid == id);
  }
  getusergroups(id:any) {
    this.UserGroupsList1 = this.UserGroupsList.filter((x:any)  => x.fkSoftwareId == id);
    this.usergroupsList1=this.usergroupsList.filter((x:any)=>x.sid==id);
  }
  getusersubgroups(id:any) {
    this.userIdRequestlist.forEach(req=>{
      if(req.userGroups == id)
      {
        req.UserSubGroupsList1 = this.UserSubGroupsList.filter((x:any)  => x.fkUserGroupId == id);
      }
    })
   
  }

 
  closePriority:any;
  getApproversList(value:any) {
    this.getusergroups(value.sid);
     this.getroleslist(value.sid);
     this.Approver1 = false;
     this.Approver2 = false;
     this.Creator = false;
     this.Review = false;
     this.Closure = false;
    // let request:any;
     //request = Object.assign({}, value);
     if (this.isEdit) {
       var loc = this.locationList.find((x:any)  => x.id == value.locationId);
     }
     else {
       var loc = this.locationList.find((x:any)  => x.id == this.currentUser.baselocation);
     }
     var software = this.softwareList.find((x:any)  => x.id == value.sid);
     if(software.name !='SAP UserId')
     {
       var keyvalue = loc.code + '~' + software.name + ',' + 6;
     }
     else{
       if(value.catogery=='Primary SAP UserId')
       {
         var cat='PR';
       }
       else{
         var cat='SE';
       }
       if(value.requestType=='Block ID')
       {
         var subCat='B'
       }
       else if(value.requestType=='Changes in Existing ID')
       {
         var subCat='C'
       }
       else if(value.requestType=='Delete ID')
       {
         var subCat='D'
       }
       else if(value.requestType=='New ID')
       {
         var subCat='N'
       }
       else if(value.requestType=='Rename ID')
       {
         var subCat='R'
       }
       else 
       {
         var subCat='P';
       }
       
       var keyvalue = loc.code + '~' + cat + '~' + subCat + ',' + 6;
     }
     this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVERS_GETBY_PARAM_ALL, keyvalue).then((data: any) => {
       this.isLoading = true;
       if (data.length > 0) {
        
         if(this.requestType != "Creation"  && this.requestType !="Password Reset/Unlocking" && software.name !='Others' && software.name !='SAP UserId'
         && software.name!='SAP Roles' && software.name!='SAP Authorization')
         { 
          let apprs=data.filter((x:any)=>x.priority !=1 && x.closure !=1);
          let reviewer:any; 
          if(this.isEdit)
           {
            let dep=this.DepartmentList.find(x=>x.name==this.userIdRequest.department && x.isActive==1)
            reviewer=data.find(x=>x.priority==1 && x.dept==dep.id)
           }
           else{
            reviewer=data.find(x=>x.priority==1 && x.dept==this.currentUser.fK_Department)
           }
           
           this.Approverslist=apprs;
           if(reviewer !=null || reviewer !=undefined)
           {
             this.Approverslist.push(reviewer);
           }
          // this.Approverslist = data.filter((x:any)=>x.closure !=1);
           this.Approverslist.forEach((element:any)=> {

             element.role = element.role=="Creator"?"Closure":element.role;
           });
         }
         else if(software.name !='Others'  && this.requestType !="Password Reset/Unlocking"  && software.name !='SAP UserId' && software.name!='SAP Roles' && software.name!='SAP Authorization'){
           let apprs=data.filter((x:any)=>x.priority !=1);
           let reviewer:any; 
           if(this.isEdit)
           {
            let dep=this.DepartmentList.find(x=>x.name==this.userIdRequest.department && x.isActive==1)
            reviewer=data.find(x=>x.priority==1 && x.dept==dep.id)
           }
           else{
            reviewer=data.find(x=>x.priority==1 && x.dept==this.currentUser.fK_Department)
           }         
           
           this.Approverslist=apprs;
           if(reviewer !=null || reviewer !=undefined)
           {
             this.Approverslist.push(reviewer);
           }
           
           //this.Approverslist = data;
        }
         
         this.userIdRequestlist.forEach(req=>{
           if(value.sid==req.sid)
           {
             req.UserGroupsList1 = this.UserGroupsList.filter((x:any)  => x.fkSoftwareId == req.sid);
             if (this.requestType != "Password Reset/Unlocking") {
             if(software.name=='SAP UserId')
             {
               if(software.name=='SAP UserId')
               {
                 req.softwareRolesList1 = this.softwareRolesList.filter((x:any)  => x.sid == req.sid && x.location==loc.code && req.catogery.includes(x.description));
               }
               else{
                 req.softwareRolesList1 = this.softwareRolesList.filter((x:any)  => x.sid == req.sid);
               }              
               if(this.ApprovingManager[0].employeeId != data.find(x=>x.priority==2).approverId)
               {
                 let Approver:any= {};
                 Approver.approverId=this.ApprovingManager[0].employeeId;
                 Approver.approverName=this.ApprovingManager[0].fullName
                 Approver.role = 'Approver';
                 Approver.keyValue=keyvalue;
                 Approver.department=this.ApprovingManager[0].department;
                 Approver.priority=1;
                 Approver.isActive=true;
                 data.push(Approver)
                 req.Approverslist=data;
                 
               }
               else{
                 data.forEach((element:any)=> {

                   element.priority=element.priority-1
                 });
                 req.Approverslist=data;
               }
               this.Approverslist=data;
             }
             else if (software.name=='Others' || software.name=='SAP Roles' || software.name=='SAP Authorization')
             {
              if(software.name=='SAP Roles' || software.name=='SAP Authorization')
              {
                req.softwareRolesList1 = this.softwareRolesList.filter((x:any)  => x.sid == req.sid && x.location==loc.code);
              }
              if(software.name=='Others')
              {
                let apprs=data.filter((x:any)=>x.priority !=1);
                let reviewer:any; 
                if(this.isEdit)
                {
                 let dep=this.DepartmentList.find(x=>x.name==this.userIdRequest.department && x.isActive==1)
                 reviewer=data.find(x=>x.priority==1 && x.dept==dep.id)
                }
                else{
                 reviewer=data.find(x=>x.priority==1 && x.dept==this.currentUser.fK_Department)
                }         
                
                this.Approverslist=apprs;
                if(reviewer !=null || reviewer !=undefined)
                {
                  this.Approverslist.push(reviewer);
                }
              }
              else{
                this.Approverslist=data.filter((x:any)=>x.isActive==1);
              }
              req.Approverslist=this.Approverslist;
             }
             else{
               req.softwareRolesList1 = this.softwareRolesList.filter((x:any)  => x.sid == req.sid);
               if(this.requestType != "Creation")
               {
                 req.Approverslist=this.Approverslist;
                 req.Approverslist.forEach((element:any)=> {

                   element.role = element.role=="Creator"?"Closure":element.role;
                 });
               }
               else{
                 req.Approverslist=this.Approverslist;
               }
             }
            }
            else {
              req.Approverslist = data.filter((x:any)  => x.role == 'Creator');
              req.Approverslist.forEach((element:any)=> {

                element.role = element.role == "Creator" ? "Closure" : element.role;
                element.priority = 1;
              });
              this.Approverslist = req.Approverslist;
            }
            //req.Approverslist=data;
             req.Approverslist = req.Approverslist.sort((a:any, b:any) => {
               if (a.priority > b.priority) return 1;
               if (a.priority < b.priority) return -1;
               return 0;
             });
           }
         })
         this.Approverslist = this.Approverslist.filter((x:any)  => x.isActive == true);
         let empid = this.currentUser.employeeId
         let empName = this.currentUser.fullName;
 
         let Appr1 = this.Approverslist.find((x:any)  =>  x.approverId == empid ||
           x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
           x.parllelApprover3 == empid || x.parllelApprover4 == empid && x.role != 'Creator');
 
         if (Appr1 != null || Appr1 != undefined) {
           this.Approverid1 = Appr1.approverId;
           this.Approver1 = true;
           this.Review = true;
           this.Aprlpriority = Appr1.priority;
         }
         let Appr2 = this.Approverslist.find((x:any)  => x.approverId == empid ||
           x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
           x.parllelApprover3 == empid || x.parllelApprover4 == empid && x.role != 'Creator');
         if (Appr2 != null || Appr2 != undefined) {
           this.Approver1 = true;
           this.Approver2 = true;
           this.Approverid2 = Appr2.approverId;
           this.Review = true;
           this.Aprlpriority = Appr2.priority;
         }
         let Appr3 = this.Approverslist.find((x:any)  => (x.approverId == empid ||
           x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
           x.parllelApprover3 == empid || x.parllelApprover4 == empid) && x.role=='Creator');  
           let Appr4 = this.Approverslist.find((x:any)  => (x.approverId == empid ||
             x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
             x.parllelApprover3 == empid || x.parllelApprover4 == empid) && x.role=='Closure');        
         let clos=this.transactionslist.find(x=>x.approvalPriority==3 && x.transactionType==1 )
         if(this.requestType!='Creation' && software.name !='Others')
         {
           if (Appr3 != undefined) {
             this.Approver1 = true;
             this.Approver2 = true;
             this.Review = true;
             this.Aprlpriority = Appr3.priority;
             
               this.Creator = true;       
            
               this.Closure = false;
             
           }  
           if (Appr4 != undefined) {
             this.Approver1 = true;
             this.Approver2 = true;
             this.Review = true;
             this.Aprlpriority = Appr4.priority;
             
               this.Creator = true;  
               this.Closure = true;
               this.closePriority=Appr4.priority;
             
           }
         }
         else{
           if (clos==undefined && Appr3 != undefined) {
             this.Approver1 = true;
             this.Approver2 = true;
             this.Review = true;
             this.Aprlpriority = Appr3.priority;
             
               this.Creator = true;       
            
               this.Closure = false;
             
           }  
           if (clos!=undefined && Appr4 != undefined) {
             this.Approver1 = true;
             this.Approver2 = true;
             this.Review = true;
             this.Aprlpriority = Appr4.priority;
             
               this.Creator = true;  
               this.Closure = true;
               this.closePriority=Appr4.priority;
             
           }
           let list=this.transactionslist.reverse();
           let clorev=list.find(x=>x.approvalPriority==4 && x.transactionType==3 )
           if (clorev!=undefined && Appr3 != undefined) {
             this.Approver1 = true;
             this.Approver2 = true;
             this.Review = true;
             this.Aprlpriority = Appr3.priority;
             
               this.Creator = true;  
               this.Closure = false;
               //this.closePriority=Appr4.priority;
             
           }
         }
        
 
         this.transactionslist.forEach((ad) => {
           let temp = this.Approverslist.find((x:any)  => x.priority == ad.approvalPriority);
           if (temp != undefined) {
             if (ad.transactionType == 1) {
               if (temp.role == 'Creator') {
                 ad.status = 'Completed'
               }
               else if (temp.role == 'Closure') {
                 ad.status = 'Closed'
               }
               else if (temp.role == 'Approver') {
                 ad.status = 'Approved'
               }
               else {
                 ad.status = this.approverstatuslist.find((x:any)  => x.id == ad.approvalPriority).name;
               }
             }
             else if (ad.transactionType == 3 || ad.transactionType == 4) {
               ad.status = ad.transactionType == 3 ? "Reverted To Previous Approver " : " Reverted to Initiator";
             }
             else {
               ad.status = ad.transactionType == 2 ? "Rejected" : "";
             }
             // ad.approverName = temp.approverName;
             // ad.department = temp.department;
             ad.role = temp.role;
           }
 
         });
         this.Approverslist.forEach((ad) => {
           let temp1 = this.transactionslist.find((x:any)  => x.approvalPriority == ad.priority && x.transactionType==1);
           if (temp1 == undefined) {
             let trans = {} as Transactions;
             trans.doneBy = ad.approverId;
             trans.approvalPriority = ad.priority;
             trans.approverName = ad.approverName;
             trans.department = ad.department;
             trans.role = ad.role;
             this.transactionslist.push(trans);
           }
 
 
         });
         this.Approverslist = this.Approverslist.sort((a:any, b:any) => {
           if (a.priority > b.priority) return 1;
           if (a.priority < b.priority) return -1;
           return 0;
         });
         this.transactionslist = this.transactionslist.sort((a:any, b:any) => {
           if (a.doneOn > b.doneOn) return 1;
           if (a.doneOn < b.doneOn) return -1;
           if (a.approvalPriority > b.approvalPriority) return 1;
           if (a.approvalPriority < b.approvalPriority) return -1;
           return 0;
         });
 
       }
       else {
         this.Approverslist = [];
       }
       //this.reInitDatatable();
       this.isLoading = false;
     }).catch((error)=> {
       this.isLoading = false;
       this.Approverslist = [];
     });
   }

   getloc1(id:any) {
    let loc = this.locationList.find((x:any)  => x.id == id);
    return loc ? loc.code + '-' + loc.name : "";
  }
  currentUser1: AuthData;
  getEmpDetails(empId) {
    this.errMsg = "";
    this.isLoading = true;
    //this.UserGroupsList=[];
    this.httpService.getByParam(APIURLS.BR_GET_EMP_DETAILS_API, empId).then((data: any) => {
      if (data.employeeId > 0) {
        // this.currentUser = data;
        this.userIdRequest.requestDate = this.requestdate;
        this.userIdRequest.plant = this.getloc1(data.baselocation);
        this.userIdRequest.employeeId = data.employeeId;
        this.userIdRequest.firstName = data.firstName;
        this.userIdRequest.lastName = data.lastName;
        this.userIdRequest.fullName = data.fullName;
        this.userIdRequest.designation = data.designation;
        this.userIdRequest.department = data.department;
        this.userIdRequest.reportingManager = data.reportingManager;
        this.userIdRequest.joiningDate = data.joiningDate;
        this.userIdRequest.staffCategory = data.category;
        this.userIdRequest.payGroup = data.division;

      }
      else {
        this.Error = "Error";
        swal({
          title: "Message",
          text: "Entered employee code (" + empId + ") does not exist.Please check again or contact administator",
          icon: "warning",
          dangerMode: false,
          buttons: [false, true]
        })
      }
      // this.reInitDatatable();()
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.currentUser = {} as AuthData;
    });
  }

  
  onClickNewRequest() {
    //this.resetForm();

    this.userIdRequestsearchlist = [];
    this.selectedSoftwares=[];
    this.userIdRequest = {} as UserIdRequest;
    jQuery("#searchModal").modal('show');

  }
 

  ApprovingManager:any[]=[];
  getApprovingManager(value) {
    let filterModel :any={};
    filterModel.onBehalfEmp=value;
    this.httpService.post(APIURLS.BR_USER_ID_REQUEST_APPROVER_API, filterModel).then((data: any) => {
      this.isLoading = true;
      if (data.employeeId > 0) {
        this.ApprovingManager.push(data);
      //   this.Approverslist.push(data);
      //   this.Approverslist.forEach((element:any)=> {

      //     element.type="Approving Manager";
      //   });
      //   //this.transactionslist.reverse();
      //  // this.Approver='Approving Manager';
      //   let temp=this.Approverslist.find(x=>x.employeeId==this.currentUser.employeeId);
      //   this.Approver=temp ==undefined?this.Approver:'Approving Manager';
      //   //this.ApprvrM=temp ==undefined?false:true;
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.Approverslist = [];
    });
    
  }

  transactionsHistory: any[] = [];
  getHistory(reqNo) {
    this.Approver1 = false;
    this.Approver2 = false;
    this.Creator = false;
    this.Review = false;
    this.Closure = false;
    this.httpService.getByParam(APIURLS.GET_REQUEST_HISTORY, reqNo).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.transactionsHistory = data;
        let temp = this.transactionsHistory.find((x:any)  => (x.doneBy == this.currentUser.employeeId || x.parallelApprover1 == this.currentUser.employeeId
          || x.parallelApprover2 == this.currentUser.employeeId || x.parallelApprover3 == this.currentUser.employeeId ||
          x.parallelApprover4 == this.currentUser.employeeId) && x.transactionType == null);

        if (temp) {
          if (temp.role == 'Reviewer') {
            this.Approverid1 = temp.doneBy;
            this.Approver1 = true;
            this.Review = true;
            this.Aprlpriority = temp.priority;
          }
          if (temp.role == 'Approver') {
            this.Approverid1 = temp.doneBy;
            this.Approver1 = true;
            this.Review = true;
            this.Aprlpriority = temp.priority;
            this.Approverid2 = temp.doneBy;
          }
          if (temp.role == 'Creator') {
            this.Approverid1 = temp.doneBy;
            this.Approver1 = true;
            this.Review = true;
            this.Aprlpriority = temp.priority;
            this.Approverid2 = temp.doneBy;
            this.Creator = true;
          }
          if (temp.role == 'Closure') {
            this.Approverid1 = temp.doneBy;
            this.Approver1 = true;
            this.Review = true;
            this.Aprlpriority = temp.priority;
            this.Approverid2 = temp.doneBy;
            this.Creator = true;
            this.Closure = true;
          }
        }
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.transactionsHistory = [];
    });
  }

  initiatorDet: any = {};
  getInitiatorDetails(empId) {
    this.errMsg = "";
    this.isLoading = true;
    //this.UserGroupsList=[];
    this.httpService.getByParam(APIURLS.BR_GET_EMP_DETAILS_API, empId).then((data: any) => {
      if (data.employeeId > 0) {
        // this.currentUser = data;
        this.initiatorDet.employeeId = data.employeeId;
        this.initiatorDet.fullName = data.fullName;
        this.initiatorDet.designation = data.designation;
        this.initiatorDet.department = data.department;
      }

      // this.reInitDatatable();()
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.currentUser = {} as AuthData;
    });
  }


  others:boolean=false;
  empId: string
  view: boolean = false;
  locationName: string
  attachments: any[] = [];
  room ={} as UserIdRequest;
  software:any;
  softwarerole:any;
  newRole:any;
  Plantsassigned:any[]=[];
  requestType: string
  onBehalfEmp: string
  plants:any[]=[];
  Error:any;
  userIdRequest1 ={} as UserIdRequest;
  submit:boolean;
  ReviewerList: any[] = [];
  fileslist: any[] = [];
  fileslist1: File[] = [];
  ApproverIdslist: any[] = [];
  onUserActions(isedit: boolean, userIdRequest: UserIdRequest, isprint: boolean, value: string) {
    this.isEdit = isedit;
    this.ReviewerList = [];
    this.ApproverIdslist = [];
    this.view = false;
    this.errMsg1 = "";
    this.errMsgPop = "";
    this.transactionslist = [];
    this.transactionsHistory = [];
    this.transactionslist1 = [];
    this.Approverslist = [];
    this.ApprovingManager = [];
    this.attachments = [];
    this.fileslist = [];
    this.fileslist1 = [];
    this.userIdRequestlist = [];
    this.userIdRequest = {} as UserIdRequest
    this.Plantsassigned = [];
    this.Error = null;
    this.plants = [];
    this.isLoadingPop = false;
    this.isLoading = false;
    this.EquipmentDetails = [];
    this.userIdRequestlist = [];
    this.Plantsassigned = [];
    this.printDomains = [];
    this.RepDomains = [];
    this.Newroles = [];
    this.masterList = [];
    this.ProfileList = [];
    this.ModuleList = [];
    this.Error = null;
    this.plants = [];
    this.roles = [];
    //this.reset();
    this.gettransactions(userIdRequest.requestNo);
    this.gettransactionsHistory(userIdRequest.requestNo);
    if (isedit) {
      this.getInitiatorDetails(userIdRequest.createdBy);
      this.requestType = userIdRequest.requestType;
      // if (this.getsoft(userIdRequest.sid) != 'QAMS') {
      //   this.NQonUserActions(isedit, userIdRequest, isprint, value);
      //   return;
      // }
      // else {
      this.getEmpDetails(userIdRequest.onBehalfEmp);
      this.getApprovingManager(userIdRequest.onBehalfEmp);
      this.getHistory(userIdRequest.requestNo);
      this.GetEquipDetailsById(userIdRequest.id);
      //  this.getApproversList(userIdRequest);
      if (this.getsoft(userIdRequest.sid) == 'Trackwise') {
        var rolesList = userIdRequest.newRoleInQams ? userIdRequest.newRoleInQams.split(',') : [];
        for (let i = 0; i < rolesList.length; i++) {
          let temp = this.softwareRolesList.find((x:any)  => x.id == rolesList[i]);
          this.roles.push(temp);
        }
        this.printRoles = this.roles.map((x:any)  => x.role).join();
        var newroleslist = userIdRequest.newRoleUpdated ? userIdRequest.newRoleUpdated.split(',') : [];
        for (let i = 0; i < newroleslist.length; i++) {
          let temp = this.softwareRolesList.find((x:any)  => x.id == newroleslist[i]);
          this.Newroles.push(temp);
        }
      }
      this.software = this.getsoft(userIdRequest.sid);
      var plantList = userIdRequest.assignedPlants ? userIdRequest.assignedPlants.split(',') : [];
      for (let i = 0; i < plantList.length; i++) {
        let temp = this.locListCon.find((x:any)  => x.id == plantList[i]);
        this.plants.push(temp);
      }
      var RepDom = userIdRequest.repositoryDomains ? userIdRequest.repositoryDomains.split(',') : [];
      for (let i = 0; i < RepDom.length; i++) {
        let temp = this.RepositoryDomainsList.find((x:any)  => x.id == RepDom[i]);
        this.RepDomains.push(temp);
      }
      this.printDomains = this.RepDomains.map((x:any)  => x.name).join();

      var mas = userIdRequest.masterAssignment ? userIdRequest.masterAssignment.split(',') : [];
      for (let i = 0; i < mas.length; i++) {
        let temp = this.mastersList.find((x:any)  => x.id == mas[i]);
        this.masterList.push(temp);
      }
      this.printMasters = this.masterList.map((x:any)  => x.name).join();

      var mod = userIdRequest.userModules ? userIdRequest.userModules.split(',') : [];
      for (let i = 0; i < mod.length; i++) {
        let temp = this.SoftwareModulesList.find((x:any)  => x.id == mod[i]);
        this.ModuleList.push(temp);
      }
      this.printModules = this.ModuleList.map((x:any)  => x.name).join();

      var pro = userIdRequest.userProfiles ? userIdRequest.userProfiles.split(',') : [];
      for (let i = 0; i < pro.length; i++) {
        let temp = this.softwareUserProfilesList.find((x:any)  => x.id == pro[i]);
        this.ProfileList.push(temp);
      }
      this.printProfiles = this.ProfileList.map((x:any)  => x.name).join();

      if (this.getsoft(userIdRequest.sid) != 'Trackwise') {
        if (userIdRequest.newRoleInQams) {
          if (userIdRequest.newRoleInQams != '') {
            this.softwarerole = this.softwareRolesList.find((x:any)  => x.id == userIdRequest.newRoleInQams).role;
          }
        }
      }
      this.newRole = userIdRequest.newRoleUpdated;
      userIdRequest.selMasters = this.masterList;
      userIdRequest.selModules = this.ModuleList;
      userIdRequest.selProfiles = this.ProfileList;
      userIdRequest.selectedRoles = this.roles;
      userIdRequest.selectedNewRoles = this.Newroles;
      userIdRequest.selectedRepoDomains = this.RepDomains;
      userIdRequest.Plantsassigned = this.plants;
      this.softType = userIdRequest.softwareType;
      // userIdRequest.sid=this.selectedSoftwares[0].id;
      this.printplats = this.plants.map((x:any)  => x.code).join();
      var UGList = userIdRequest.userGroups ? userIdRequest.userGroups.split(',') : [];
      userIdRequest.usergroupsList = this.UserGroupsList.filter((s:any) => UGList.includes((s.id.toString())));
      this.printgroups = userIdRequest.usergroupsList.map((x:any)  => x.name).join();
      var USGList = userIdRequest.userSubGroups ? userIdRequest.userSubGroups.split(',') : [];
      let subList: number[]
      // subList=USGList;
      subList = USGList.map(str => {
        return Number(str);
      });
      userIdRequest.activity = userIdRequest.isActive ? 'true' : 'false';
      // userIdRequest.usersubgroupsList=subList;
      userIdRequest.usersubgroupsList = this.UserSubGroupsList.filter((s:any) => USGList.includes(s.id.toString()));
      let temp1 = userIdRequest.usersubgroupsList.find((x:any)  => x.name == 'Others');
      temp1 ? this.others = true : this.others = false;
      this.printsubgroups = userIdRequest.usersubgroupsList.map((x:any)  => x.name).join();
      var UGList = userIdRequest.userGroups ? userIdRequest.userGroups.split(',') : [];
      userIdRequest.usergroupsList = this.UserGroupsList.filter((s:any) => UGList.includes((s.id.toString())));
      var USGList = userIdRequest.userSubGroups ? userIdRequest.userSubGroups.split(',') : [];
      userIdRequest.usersubgroupsList = this.UserSubGroupsList.filter((s:any) => USGList.includes(s.id.toString()));
      if (userIdRequest.attachments != null || userIdRequest.attachments != null) {
        userIdRequest.attachmentsList = userIdRequest.attachments.split(',');
      }
      this.usergroupsList1 = this.usergroupsList.filter((x:any)  => x.sid == userIdRequest.sid);
      userIdRequest.softwareRolesList1 = this.softwareRolesList.filter((x:any)  => x.sid == userIdRequest.sid);
      this.softwareRolesList1 = this.softwareRolesList.filter((x:any)  => x.sid == userIdRequest.sid);
      this.userIdRequest = Object.assign({}, userIdRequest);
      // }

    }
    else {
      // this.requestType=userIdRequest.requestType;
      if (userIdRequest.requestNo != null || userIdRequest.requestNo != undefined) {
        this.getHistory(userIdRequest.requestNo);
        this.onBehalfEmp = userIdRequest.onBehalfEmp;
        this.requestfor = userIdRequest.requestfor;
        this.requestType = userIdRequest.requestType;
        this.Software = userIdRequest.sid.toString();
        this.GetEquipDetailsById(userIdRequest.id);
        this.softType = userIdRequest.softwareType;
        if (this.getsoft(userIdRequest.sid) == 'Trackwise') {
          var rolesList = userIdRequest.newRoleInQams ? userIdRequest.newRoleInQams.split(',') : [];
          for (let i = 0; i < rolesList.length; i++) {
            let temp = this.softwareRolesList.find((x:any)  => x.id == rolesList[i]);
            this.roles.push(temp);
          }
          this.printRoles = this.roles.map((x:any)  => x.role).join();
          var newroleslist = userIdRequest.newRoleUpdated ? userIdRequest.newRoleUpdated.split(',') : [];
          for (let i = 0; i < newroleslist.length; i++) {
            let temp = this.softwareRolesList.find((x:any)  => x.id == newroleslist[i]);
            this.Newroles.push(temp);
          }
        }

        var plantList = userIdRequest.assignedPlants ? userIdRequest.assignedPlants.split(',') : [];
        for (let i = 0; i < plantList.length; i++) {
          let temp = this.locListCon.find((x:any)  => x.id == plantList[i]);
          this.plants.push(temp);
        }
        var RepDom = userIdRequest.repositoryDomains ? userIdRequest.repositoryDomains.split(',') : [];
        for (let i = 0; i < RepDom.length; i++) {
          let temp = this.RepositoryDomainsList.find((x:any)  => x.id == RepDom[i]);
          this.RepDomains.push(temp);
        }
        var mas = userIdRequest.masterAssignment ? userIdRequest.masterAssignment.split(',') : [];
        for (let i = 0; i < mas.length; i++) {
          let temp = this.mastersList.find((x:any)  => x.id == mas[i]);
          this.masterList.push(temp);
        }
        this.printMasters = this.masterList.map((x:any)  => x.name).join();

        var mod = userIdRequest.userModules ? userIdRequest.userModules.split(',') : [];
        for (let i = 0; i < mod.length; i++) {
          let temp = this.SoftwareModulesList.find((x:any)  => x.id == mod[i]);
          this.ModuleList.push(temp);
        }
        this.printModules = this.ModuleList.map((x:any)  => x.name).join();

        var pro = userIdRequest.userProfiles ? userIdRequest.userProfiles.split(',') : [];
        for (let i = 0; i < pro.length; i++) {
          let temp = this.softwareUserProfilesList.find((x:any)  => x.id == pro[i]);
          this.ProfileList.push(temp);
        }
        this.printProfiles = this.ProfileList.map((x:any)  => x.name).join();
        userIdRequest.selMasters = this.masterList;
        userIdRequest.selModules = this.ModuleList;
        userIdRequest.selProfiles = this.ProfileList;
        userIdRequest.selectedRoles = this.roles;
        userIdRequest.selectedNewRoles = this.Newroles;
        userIdRequest.selectedRepoDomains = this.RepDomains;
        userIdRequest.Plantsassigned = this.plants;
        // userIdRequest.sid=this.selectedSoftwares[0].id;
        var UGList = userIdRequest.userGroups ? userIdRequest.userGroups.split(',') : [];
        userIdRequest.usergroupsList = this.UserGroupsList.filter((s:any) => UGList.includes((s.id.toString())));
        var USGList = userIdRequest.userSubGroups ? userIdRequest.userSubGroups.split(',') : [];
        userIdRequest.usersubgroupsList = this.UserSubGroupsList.filter((s:any) => USGList.includes(s.id.toString()));

        this.usergroupsList1 = this.usergroupsList.filter((x:any)  => x.sid == userIdRequest.sid);
        userIdRequest.softwareRolesList1 = this.softwareRolesList.filter((x:any)  => x.sid == userIdRequest.sid);

      }
      else {

        userIdRequest.sid = +this.Software;
        if (this.locationCode != null || this.locationCode != undefined) {
          userIdRequest.locationId = +this.locationCode;
        }
        else {
          userIdRequest.locationId = this.currentUser.baselocation;
        }

      }

      this.submit = true;
      var selectedSoftwares = this.softwareList.find((x:any)  => x.id == this.Software);
      userIdRequest.name = selectedSoftwares.name;
      // this.getApproversList(userIdRequest);
      if (userIdRequest.status == 'Reverted to initiator') {
        this.requestfor = userIdRequest.requestfor;
        this.onBehalfEmp = userIdRequest.onBehalfEmp;
        this.requestType = userIdRequest.requestType;
      }

      if (this.requestfor == 'on-Behalf') {
        this.getEmpDetails(this.onBehalfEmp);
        this.getApprovingManager(this.onBehalfEmp);
      }
      else {
        this.getEmpDetails(this.currentUser.employeeId);
        this.getApprovingManager(this.currentUser.employeeId);
      }
      this.UserSubGroupsList1 = this.UserSubGroupsList.filter((x:any)  => x.fkSoftwareId == userIdRequest.sid);
      // this.userIdRequest = Object.assign({}, userIdRequest);

      // var plantList = userIdRequest.assignedPlants ? userIdRequest.assignedPlants.split(',') : [];
      // for (let i = 0; i < plantList.length; i++) {
      //   let temp = this.locListCon.find((x:any)  => x.id == plantList[i]);
      //   this.plants.push(temp);
      // }
      // userIdRequest.Plantsassigned = this.plants;
      // var UGList = userIdRequest.userGroups ? userIdRequest.userGroups.split(',') : [];
      // userIdRequest.usergroupsList = this.UserGroupsList.filter((s:any) => UGList.includes((s.id.toString())));
      // var USGList = userIdRequest.userSubGroups ? userIdRequest.userSubGroups.split(',') : [];
      // userIdRequest.usersubgroupsList = this.UserSubGroupsList.filter((s:any) => USGList.includes(s.id.toString()));
      if (userIdRequest.attachments != null || userIdRequest.attachments != null) {
        userIdRequest.attachmentsList = userIdRequest.attachments.split(',');
      }

      userIdRequest.UserSubGroupsList1 = this.UserSubGroupsList.filter((x:any)  => x.fkSoftwareId == this.Software);
      userIdRequest.softwareRolesList1 = this.softwareRolesList.filter((x:any)  => x.sid == userIdRequest.sid);
      let loc = this.locationList.find((x:any)  => x.id == userIdRequest.locationId)
      if (this.softType == 'Plant Level') {
        this.softwareRolesList1 = this.softwareRolesList.filter((x:any)  => x.sid == userIdRequest.sid && x.location == loc.code);
      }
      this.getApproversList(userIdRequest);

      this.UserSubGroupsList1 = this.UserSubGroupsList.filter((x:any)  => x.fkSoftwareId == userIdRequest.sid);
      this.userIdRequest = Object.assign({}, userIdRequest);
      // }
    }

    if (value == 'View') {
      this.view = true;
    }
    // if(this.Error == null)
    // {
    let soft = this.softwareList.find((x:any)  => x.id == userIdRequest.sid);



    if (isprint) {

      this.userIdRequest1 = Object.assign({}, userIdRequest)
      if (this.softType == 'Plant Level') {
        jQuery('#GprintModal').modal('show');
      }
      else if (this.requestType == 'Activation/Inactivation') {
        jQuery('#IprintModal').modal('show');
      }
      else {
        var name = this.requestType.toLocaleUpperCase()
        jQuery('#printModal').modal('show');
      }

      //this.downloadPdf();
    }
    else if (this.softType == 'Plant Level') {
      jQuery("#searchModal").modal('hide');
      jQuery('#generalModal').modal('show');
    }
    else if (soft.name != 'DMS' && soft.name != 'QAMS' && soft.name != 'NICHELON'
      && soft.name != 'CLEEN' && soft.name != 'LIMS' && soft.name != 'Unnati' && soft.name != 'Trackwise') {
      jQuery("#searchModal").modal('hide');
      jQuery('#ADModal').modal('show');
    }
    else if (this.requestType == 'Activation/Inactivation') {
      jQuery("#searchModal").modal('hide');
      jQuery('#inactiveModal').modal('show');
    }
    else if (this.requestType == 'Password Reset/Unlocking') {
      jQuery("#searchModal").modal('hide');
      jQuery('#passwordModal').modal('show');
    }
    else {
      jQuery("#searchModal").modal('hide');
      jQuery('#myModal').modal('show');
    }


    // inactiveModal

  }
  RepDomains:any[]=[];
  printDomains:any;
  masterList:any[]=[];
  printMasters:any;
  ModuleList:any[]=[];
  printModules:any;
  ProfileList:any[]=[];
  printProfiles:any;

  rolesList:any;
  printRoles:any;
  roles:any[]=[];
  newrolesList:any;
  printNewRoles:any;
  Newroles:any[]=[];
  printplats:any;
  printgroups:any;
  printsubgroups:any;
 
  isValid: boolean = false;
  validatedForm: boolean = true;

  image!: string
  getbase64image() {
    this.http.get('../../assets/dist/img/micrologo.png', { responseType: 'blob' })
      .subscribe(blob => {
        const reader = new FileReader();
        const binaryString = reader.readAsDataURL(blob);
        reader.onload = (event: any) => {
          console.log('Image in Base64: ', event.target.result);
          this.image = event.target.result;
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
  setFormatedTime(date: any) {
    let dt = new Date(date);
    let formateddate =
      ("00" + dt.getHours()).slice(-2) + ":" +
      ("00" + dt.getMinutes()).slice(-2) + ":" +
      ("00" + dt.getSeconds()).slice(-2);
    return formateddate;
  }
  locationname!: string
  downloadPdf() {
    // var temp=this.materialList.find(x=>x.id==this.filtermaterialtype);
    //generalpdf
    var printContents: any;
    printContents = document.getElementById('pdf').innerHTML;
    var temp1 = this.locationList.find((x:any)  => x.id == this.currentUser.baselocation);
    var OrganisationName = "MICRO LABS LIMITED" + ', ' + temp1.code + '-' + temp1.name;
    var ReportName = 'USER ID REQUEST REPORT';
    var printedBy = this.currentUser.employeeId + ' - ' + this.currentUser.fullName;
    var now = new Date();
    var jsDate = this.setFormatedDateTime(now);
    var logo = this.image;
    var reason='';
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
    })*/
    var docDefinition = {
      info: {
        title: 'User Id Form',
      },

      content: [
     //   htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 9,
        //p: { margin: [10, 15, 10, 20] },
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
      pageMargins: [40, 100, 40, 60],
      pageOrientation: 'portrait',
      header: function (currentPage:any, pageCount:any) {
        return {

          columns: [
            {
              // pageMargins: [40, 80, 40, 60],
              style: 'tableExample',
              color: '#444',
              table: {
                widths: [50, 370, 70],
                headerRows: 2,
                keepWithHeaderRows: 1,
                body: [
                  [{
                    rowSpan: 2, image: logo,
                    width: 50,
                    alignment: 'center'
                  }
                    , { text: OrganisationName, bold: true, fontSize: 15, color: 'black', alignment: 'center', height: '*' },
                  {
                    rowSpan: 2, text: ['Page ', { text: currentPage.toString() }, ' of ',
                      { text: pageCount.toString() }], bold: true, fontSize: 10, color: 'black', alignment: 'center'
                  }],
                  [''
                    , { text: ReportName, bold: true, fontSize: 14, color: 'black', alignment: 'center', height: '*' }, '']

                ]
              }
            }
          ],
          margin: [40, 40, 40, 60]
        }
      },
      footer: function () {
        return {

          columns: [

            {
              alignment: 'left',
              stack: [
                { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + jsDate + '.' + ' This document printed electronically through Unnati v2.0 software' },
                { text: 'Reason' + ": " + reason }
              ],
              bold: true,
              fontSize: 8,
              // width: 120,
              // margin: [0, 0, 20, 0]
            }

          ],
          margin: 20
        }
      },
    };
    //pdfMake.createPdf(docDefinition).open();
  }

  EquipmentDetails:any[]=[];

  GetEquipDetailsById(id:any) {
    this.isLoading = true;
    let connection: any;
    connection = this.httpService.getById(APIURLS.USERID_EQUIPDETAILS_GETBYID, id);
    connection.then((data:any) => {
      if (data.length > 0) {
        data.forEach((element)=>{
          let equip:any = {};
          equip.id= element.id;
          equip.name = element.equipmentName;
          equip.equipId =element.equipmentId;
          equip.area = element.areaorLocation;
          equip.reqId= element.reqId;
          equip.requestNo= element.requestNo;
          equip.sid= element.sid;
          this.EquipmentDetails.push(equip);
        });       
      }
      this.isLoading = false;
    }).catch((error) => {
      this.isLoading = false;
      this.EquipmentDetails = [];
    })
  }

}