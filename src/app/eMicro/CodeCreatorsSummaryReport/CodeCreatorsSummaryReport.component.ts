import { AuthData } from '../../auth/auth.model'
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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

import { ItemCodeExtension} from '../ItemCodeExtension/ItemCodeExtension.model';
import {ProcessMaster} from '../Masters/ProcessMaster/ProcessMaster.model';
import {MaterialGroup} from '../Masters/MaterialGroup/MaterialGroup.model';
import {StorageLocation} from '../Masters/StorageLocation/StorageLocation.model';
import { MaterialType } from '../../masters/material/materialtype.model';
import { UOM } from '../../masters/uom/uom.model';
import { DmfGrade } from '../Masters/dmfgrademaster/dmfgrademaster.model';
import { PharmaGrade } from '../Masters/PharmacopeialGrade/PharmacopeialGrade.model';
import { PurchaseGroup } from '../Masters/PurchaseGroup/PurchaseGroup.model';
import { Transactions } from '../ItemCodeCreation/transactions.model';
import { WorkFlowApprovers } from '../Masters/WorkFlowApprovers/WorkFlowApprovers.model';
import { StorageCondition } from '../Masters/storagecondition/storagecondition.model';
import { TempCondition } from '../Masters/tempcondition/tempcondition.model';
import { Country } from '../Masters/Country/Country.model';
import { stringify } from 'querystring';
import { ItemCodeRequest } from '../ItemCodeCreation/ItemCodeCreation.model';

import * as XLSX from 'xlsx';  
//import * as FileSaver from 'file-saver';
//import { saveAs } from 'file-saver';
declare var require: any;
//import { Chart } from 'chart.js';
//import { ChartDataLabels } from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-CodeCreatorsSummaryReport',
  templateUrl: './CodeCreatorsSummaryReport.component.html', 
  styleUrls: ['./CodeCreatorsSummaryReport.component.css']
})
export class CodeCreatorsSummaryReportComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger!: MatAutocompleteTrigger;
  @ViewChild('myInput', { static: false }) myInputVariable!: ElementRef;
  
  // @ViewChild(NgForm  , { static: false })dataForm!: NgForm;
  // @ViewChild(NgForm  , { static: false })PMForm!: NgForm;
  // @ViewChild(NgForm  , { static: false })BULKForm!: NgForm;
  // @ViewChild(NgForm  , { static: false })RMNGXPForm!: NgForm;
  // @ViewChild(NgForm  , { static: false })PMNGXPForm!: NgForm;
  // @ViewChild(NgForm  , { static: false })BULKNGXPForm!: NgForm;
  // @ViewChild(NgForm  , { static: false })FGNGXPForm!: NgForm;
  // @ViewChild(NgForm  , { static: false })LCNGXPForm!: NgForm;
  // @ViewChild(NgForm  , { static: false })OSENGXPForm!: NgForm;
  // @ViewChild(NgForm  , { static: false })PPCNGXPForm!: NgForm;
  // @ViewChild(NgForm  , { static: false })RMForm!: NgForm;
  searchTermBaseLoc = new FormControl();
  public filteredItemsBaseLoc = [];
  searchTermMgr = new FormControl();
  public filteredItemsMgr = [];
  searchTermRMgr = new FormControl();
  public filteredItemsRMgr = [];
  public tableWidget: any;
 
  locListCon = [];
  locListCon1 = [];

  currentUser:any;

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
  

//  ItemCodeExtensionlist:ItemCodeExtension[]=[];

  status:any;
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
  to_date: any = this.today;
  
 // CustomerMastermodeldata = {} as ItemCodeExtension;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) { }

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
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
   // if (chkaccess == true) {
   // this.GetMasterCount();
    //  this.router.navigate(["/unauthorized"]);
  }



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
  filtertype:string=null;
  clearFilter() {
    this.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    this.to_date = this.today;  
    this.filtertype=null;
  }
 
 
 TotalRM:any=0;TotalPM:any=0;TotalBULK:any=0;TotalFG:any=0;
 TotalLC:any=0;TotalOSE:any=0;TotalPPC:any=0;TotalCodeExtension:any=0;
 TotalVendor:any=0;TotalCustomer:any=0;TotalService:any=0;
Total:any=0;
 Summary:boolean=false;

 PendingList:any=[];
 CompletedList:any=[];
 CreatorsList:any[]=[];
 CreatorWiseCompletedList:any[]=[];
  GetMasterCount()
  {
    this.TotalRM=0;this.TotalPM=0;this.TotalBULK=0;this.TotalFG=0;
 this.TotalLC=0;this.TotalOSE=0;this.TotalPPC=0;this.TotalCodeExtension=0;
 this.TotalVendor=0;this.TotalCustomer=0;this.TotalService=0;this.Total=0;
    this.CreatorWiseCompletedList=[];
    var filterModel: any = {};
    this.isLoading = true;
    let td = new Date();
    let formatedFROMdate: string
    let formatedTOdate: string
    if (this.from_date == '' || this.from_date == null) {
      formatedFROMdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" + "01";
      this.from_date = new Date(td.getFullYear(), td.getMonth(), 1);
    }
    else {
      let fd = new Date(this.from_date);
      formatedFROMdate = fd.getFullYear() + "-" + ("00" + (fd.getMonth() + 1)).slice(-2) + "-" +
        ("00" + fd.getDate()).slice(-2);
      this.from_date = new Date(fd.getFullYear(), fd.getMonth(), fd.getDate());

    }
    filterModel.fromDate = this.getFormatedDateTime(this.from_date);
    filterModel.toDate = this.getFormatedDateTime(this.to_date);
    this.httpService.post(APIURLS.BR_GET_SAP_CREATOR_COUNT,filterModel).then((data: any) => {
      if (data) {
       this.PendingList=data.filter((x:any)=>x.status=='Pending');
       this.CompletedList=data.filter((x:any)=>x.status=='Completed');
       this.CreatorsList = this.CompletedList
       .map(item => item.saP_CREATED_BY)
       .filter((value, index, self) => self.indexOf(value) === index);

       this.CreatorsList.forEach((element:any)=> {

        let list={Creator:null, RM:null, PM:null,BULK:null, FG:null, OSE:null, LC:null, PPC:null, CodeExtension:null, Customer:null
            , Vendor:null, Service:null,Total:0}

            list.Creator=element;
            let temp=this.CompletedList.find(x=>x.type=='RM' && x.saP_CREATED_BY==element);
            list.RM= temp?temp.count:0;
            let pm=this.CompletedList.find(x=>x.type=='PM' && x.saP_CREATED_BY==element);
            list.PM= pm?pm.count:0;
            let bulk=this.CompletedList.find(x=>x.type=='BULK' && x.saP_CREATED_BY==element);
            list.BULK= bulk?bulk.count:0;
            let fg=this.CompletedList.find(x=>x.type=='FG' && x.saP_CREATED_BY==element);
            list.FG= fg?fg.count:0;
            let lc=this.CompletedList.find(x=>x.type=='LC' && x.saP_CREATED_BY==element);
            list.LC= lc?lc.count:0;
            let ose=this.CompletedList.find(x=>x.type=='OSE' && x.saP_CREATED_BY==element);
            list.OSE= ose?ose.count:0;
            let ppc=this.CompletedList.find(x=>x.type=='PPC' && x.saP_CREATED_BY==element);
            list.PPC= ppc?ppc.count:0;
            let ext=this.CompletedList.find(x=>x.type=='Item Code Extension' && x.saP_CREATED_BY==element);
            list.CodeExtension= ext?ext.count:0;
            let cust=this.CompletedList.find(x=>x.type=='Customer Master' && x.saP_CREATED_BY==element);
            list.Customer= cust?cust.count:0;
            let vend=this.CompletedList.find(x=>x.type=='Vendor Master' && x.saP_CREATED_BY==element);
            list.Vendor= vend?vend.count:0;
            let service=this.CompletedList.find(x=>x.type=='Service Master' && x.saP_CREATED_BY==element);
            list.Service= service?service.count:0;
            list.Total=+list.BULK+ +list.CodeExtension+ +list.Customer+ +list.FG+ +list.LC+
                        +list.OSE+ +list.PM+ +list.PPC+ +list.RM+ +list.Service;
            this.CreatorWiseCompletedList.push(list);
       });

       this.CreatorWiseCompletedList.forEach((element:any)=> {

            this.TotalRM=+this.TotalRM + +element.RM;
            this.TotalPM=+this.TotalPM + +element.PM;
            this.TotalBULK=+this.TotalBULK + +element.BULK;
            this.TotalFG=+this.TotalFG + +element.FG;
            this.TotalOSE=+this.TotalOSE + +element.OSE;
            this.TotalLC=+this.TotalLC + +element.LC;
            this.TotalPPC=+this.TotalPPC + +element.PPC;
            this.TotalCodeExtension=+this.TotalCodeExtension + +element.CodeExtension;
            this.TotalVendor=+this.TotalVendor + +element.Vendor;
            this.TotalCustomer=+this.TotalCustomer + +element.Customer;
            this.TotalService=+this.TotalService + +element.Service;
            
       });
       this.Total= this.TotalRM+this.TotalPM+this.TotalBULK+this.TotalFG
       +this.TotalOSE+this.TotalLC+this.TotalPPC+this.TotalCodeExtension+this.TotalVendor
       +this.TotalCustomer+ this.TotalService;
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
 
  }
  chart: any;
 
  
 
}
