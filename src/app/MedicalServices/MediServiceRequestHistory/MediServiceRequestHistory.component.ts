import { AuthData } from '../../auth/auth.model'
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { FormControl, NgForm } from '@angular/forms';
import swal from 'sweetalert';
declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { Payroll } from '../../masters/employee/employee-payroll.model';
import { Role } from '../../profile/add-role/add-role.model';
//import { debug } from 'util';
import { Location } from '../../masters/employee/location.model';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

import { stringify } from 'querystring';
import { saveAs } from 'file-saver';
declare var require: any;
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { MediServiceRequestHistory } from './MediServiceRequestHistory.model';
// import { Transactions } from '../eMicro/ItemCodeCreation/transactions.model';
// import { WorkFlowApprovers } from '../eMicro/Masters/WorkFlowApprovers/WorkFlowApprovers.model';
import { ExcelService } from '../../shared/excel-service';

@Component({
  selector: 'app-MediServiceRequestHistory',
  templateUrl: './MediServiceRequestHistory.component.html',
  styleUrls: ['./MediServiceRequestHistory.component.css']
})
export class MediServiceRequestHistoryComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;
   @ViewChild(NgForm) dataForm: NgForm;
   @ViewChild('myInput') myInputVariable: ElementRef;
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
  file: File; successMsg: string = "";
  path: string = '';
  locationList: any[] = [[]];
  locationList1: any[] = [[]];
  selectedBaseLocation: any = [];
  baseLocationnotfirst = true;

  materialtype: string;
  comments: string;
  filterAPI: string = null;
  filterstatus: string = null;
  filterlocation: string = null;
  filterrequest: string = null;
  today = new Date();
  today1: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate(),0,0,0);
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  emailid: string;
  requestdate: Date;
  Approver1: boolean = false;
  Approverid1: string = "";
  Approverid2: string = "";
  Approver2: boolean = false;
  Creator: boolean = false;
  Review: boolean = false;
  Closure: boolean = false;
  userid: string;

  Request = {} as MediServiceRequestHistory;
  storeData: any;
  jsonData: any;
  fileUploaded: File;
  worksheet: any;
  selectedDocuments:any[]=[];
  providedDocuments:any[]=[];
  approverList:any[]=[
    { id:1 ,name:'67218-Lavanya R'},
    { id:2 ,name:'79504-Salma Inamdar'},
    { id:3 ,name:'66702-Dhanalakshmi'},
    { id:4 ,name:'123601-Srivatsa Raghavendra Rao'},
    { id:5 ,name:'121173-Satish Baburao Kharatmal'},
    { id:6 ,name:'97901-Avanti Ratnakar Rao'}
  ];
  approver:any;
  user:any;
  currentUser:AuthData;


  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router
    ,private excelService:ExcelService,) { }

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
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //  this.baseLocation = this.currentUser.baselocation;
    this.emailid = this.currentUser.email;
    this.userid = this.currentUser.employeeId;
    this.user=this.currentUser.employeeId+'-'+this.currentUser.fullName;
    //this.Request.requestedBy=this.currentUser.employeeId+'-'+this.currentUser.fullName;
   // this.Request.requestDate = new Date(this.today).toLocaleString();
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    // if (chkaccess == true) {

    // this.getAllEntries();
    // this.getLocationMaster();
    // this.getAPIManufacturerlist();
    // this.getAPIlist();
    // this.getdocumentlist();
    // this.getGradelist();
    // this.getCountryList();
    // }
    // else
    //  this.router.navigate(["/unauthorized"]);
  }

}
