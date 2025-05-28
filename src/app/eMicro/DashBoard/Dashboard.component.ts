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
  selector: 'app-Dashboard',
  templateUrl: './Dashboard.component.html', 
  styleUrls: ['./Dashboard.component.css']
})
export class DashboardComponent implements OnInit {
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
  
//  CustomerMastermodel = {} as ItemCodeExtension;
 // ItemCodeRequestModel = {} as ItemCodeRequest;
 // ItemCodeRequestModelList:ItemCodeRequest[]=[];

 
//  ItemCodeExtensionlist:ItemCodeExtension[]=[];
  materialtype:string;
  comments:string;
  filterMaterialCode:string=null;
  filterstatus:string=null;
  filterlocation:string=null;
  filterrequest:string=null;
  filterplace:string=null;
  status:any;
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  emailid:string;
  requestdate:Date;
  Approver1:boolean=false;
  Approverid1:string="";
  Approverid2:string="";
  Approver2:boolean=false;
  Creator:boolean=false;
  Review:boolean=false;
  Closure:boolean=false;
  userid: string
  tdseligible:boolean;

  storeData: any;  
  jsonData: any;    
  fileUploaded!: File;  
  worksheet: any; 
  isEligibleForTds:any;
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
  this.emailid=this.currentUser.email;
  this.filterstatus='Pending';
  this.filterlocation=this.currentUser.baselocation.toString();
  this.userid = this.currentUser.employeeId;
  this.requestdate=new Date(this.today);
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
   // if (chkaccess == true) {
    this.GetMasterCount();
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
  typelist:any[]=[
    {id:1,name:'Vendor Master'},
    {id:2,name:'Service Master'},
    {id:3,name:'Customer Master'},
    {id:4 ,name:'Item Code Request'}
  ]

  Count:any ={};
  created:any;
submitted:any;
InProcess:any;
rejected:any;
completed:any;
total:any;
creator:any;
remaing:any;
 ITot:any;VTot:any;STot:any;CTot:any;
 Summary:boolean=false;
  GetMasterCount()
  {
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
    this.httpService.post(APIURLS.BR_GET_SAP_MASTER_COUNT,filterModel).then((data: any) => {
      if (data) {
        this.Summary=true;
        this.Count=data[0];      
        this.ITot=+this.Count.cre+ +this.Count.sub+ +this.Count.inp+ +this.Count.rej+ +this.Count.com
        this.VTot=+this.Count.vCre+ +this.Count.vSub+ +this.Count.vInp+ +this.Count.vRej+ +this.Count.vCom
        this.STot=+this.Count.sCre+ +this.Count.sSub+ +this.Count.sInp+ +this.Count.sRej+ +this.Count.sCom
        this.CTot=+this.Count.cCre+ +this.Count.cSub+ +this.Count.cInp+ +this.Count.cRej+ +this.Count.cCom
        this.created=+this.Count.cre+ +this.Count.vCre+ +this.Count.sCre+ +this.Count.cCre
        this.submitted=+this.Count.sub+ +this.Count.vSub+ +this.Count.sSub+ +this.Count.cSub
        this.InProcess=+this.Count.inp+ +this.Count.vInp+ +this.Count.sInp+ +this.Count.cInp
        this.rejected=+this.Count.rej+ +this.Count.vRej+ +this.Count.sRej+ +this.Count.cRej
        this.completed=+this.Count.com+ +this.Count.vCom+ +this.Count.sCom+ +this.Count.cCom 
        this.total=this.ITot+this.VTot+this.CTot+this.STot
        this.creator=this.Count.creator+ this.Count.sCreator+ this.Count.vCreator+ this.Count.cCreator+ this.Count.eCreator
        this.remaing=this.InProcess-this.creator;
        this.getchart();
        this.status='Pending with Creator= '+this.creator
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.Count =  {};
    });
 
  }
  chart: any;
 
 // public chartPlugins = [ChartDataLabels];
  datas: any = [];
  label: any[] = [];
  getchart()
  {
    

    if(this.filtertype != null)
    {
        if(this.filtertype == 'Item Code Request')
        {
            this.created=this.Count.cre;
            this.submitted=this.Count.sub;
            this.InProcess=this.Count.inp;
            this.rejected=this.Count.rej;
            this.completed=this.Count.com;
        }
        else if (this.filtertype == 'Vendor Master')
        {
            this.created=this.Count.vIre;
            this.submitted=this.Count.vSub;
            this.InProcess=this.Count.vInp;
            this.rejected=this.Count.vRej;
            this.completed=this.Count.vCom;
        }
        else if (this.filtertype == 'Service Master')
        {
            this.created=this.Count.sIre;
            this.submitted=this.Count.sSub;
            this.InProcess=this.Count.sInp;
            this.rejected=this.Count.sRej;
            this.completed=this.Count.sCom;
        }
        else
        {
            this.created=this.Count.cIre;
            this.submitted=this.Count.cSub;
            this.InProcess=this.Count.cInp;
            this.rejected=this.Count.cRej;
            this.completed=this.Count.cCom;
        }
        let name=this.filtertype
        // this.chart = new Chart('linechart', {

        //     type: 'bar',
        //     data: {
        //        labels: ['Created', 'Submitted', 'Inprocess', 'Rejected', 'Completed'],
        //       //labels: this.label,
        //     //   pieData = [this.Count.cre, this.Count.sub, this.Count.inp, this.Count.rej, this.Count.com];
        //     //   pieData1= [this.Count.vCre, this.Count.vSub, this.Count.vInp, this.Count.vRej, this.Count.vCom];
        //     //   pieData2=[this.Count.sCre, this.Count.sSub, this.Count.sInp, this.Count.sRej, this.Count.sCom];
        //     //   pieData3=[this.Count.cCre, this.Count.cSub, this.Count.cInp, this.Count.cRej, this.Count.cCom];
        //       datasets: [
        //           { data :[this.created, this.submitted, this.InProcess, this.rejected,this.completed],label:name,backgroundColor:'#3e95cd'}]
        //           },
        //     options: {
        //       title: {
        //         display: true,
        //         text: 'Status'
        //       },
        //       legend: {
        //         display: true
        //       },
        //       scales: {
        //         yAxes: [{
        //           ticks: {
        //             beginAtZero: true,
        //             callback: function (value:any) { if (Number.isInteger(value)) { return value; } }
        //             //stepSize: 1,
        //           }
        //         }]
        //       },
        //       plugins: {
        //         datalabels: {
        //           color: 'black',
        //           font: {
        //             size: 12,
        //             weight: 600
        //           },
        //           offset: 4,
        //           padding: 0,
        //           // formatter: function(value) {
        //           //   return value;
        //           // }
        //         }
        //       }
        //     }
        //   }); 
    }
    else{

        let pieData = [];
    let labels1 = [];
    let bckColor = [];
    let lab = "";
    pieData = [this.ITot, this.VTot, this.STot, this.CTot];
    
    labels1 = ['Item Code Request', 'Vendor Master', 'Service Master', 'Customer Master'];
    bckColor = ["#3e95cd", "#d9534f","#4e73df","#dfb44e"];
    lab = "Status"
   

    // this.chart = new Chart(document.getElementById("myPieChart"), {
    //   plugin:this.chartPlugins,
    //   type: 'doughnut',
    //   data: {
    //     labels: labels1,
    //     datasets: [
    //       {
    //         label: lab,
    //         backgroundColor: bckColor,
    //         data: pieData
    //       }
    //     ]
    //   },
    //   options: {
    //     maintainAspectRatio: true,
    //     responsive: true,
    //     legend: {
    //       position: 'right',
    //       labels: {
    //         padding: 20,
    //         boxWidth: 10
    //       },
    //       onClick: (e) => e.stopPropagation()
    //     },
    //     plugins: {
    //       datalabels: {
    //         color: 'white',
    //         font: {
    //           size: 15,
    //           weight: 600
    //         },
    //         offset: 4,
    //         padding: 0,
    //       }
    //     },
    //     title: {
    //       display: true,
    //       text: 'Status'
    //     }
    //   }
    // });


        // this.chart = new Chart('linechart', {

        //     type: 'bar',
        //     data: {
        //        labels: ['Created', 'Submitted', 'Inprocess', 'Rejected', 'Completed'],
        //       //labels: this.label,
        //     //   pieData = [this.Count.cre, this.Count.sub, this.Count.inp, this.Count.rej, this.Count.com];
        //     //   pieData1= [this.Count.vCre, this.Count.vSub, this.Count.vInp, this.Count.vRej, this.Count.vCom];
        //     //   pieData2=[this.Count.sCre, this.Count.sSub, this.Count.sInp, this.Count.sRej, this.Count.sCom];
        //     //   pieData3=[this.Count.cCre, this.Count.cSub, this.Count.cInp, this.Count.cRej, this.Count.cCom];
        //       datasets: [
        //           { data :[this.Count.cre, this.Count.sub, this.Count.inp, this.Count.rej, this.Count.com],label:'Item Code Request',backgroundColor:'#3e95cd'},
        //           { data: [this.Count.vCre, this.Count.vSub, this.Count.vInp, this.Count.vRej, this.Count.vCom],label:'Vendor Master',backgroundColor:'#d9534f'},
        //           { data: [this.Count.sCre, this.Count.sSub, this.Count.sInp, this.Count.sRej, this.Count.sCom], label:'Service Master',backgroundColor:'#4e73df'},
        //           { data: [this.Count.cCre, this.Count.cSub, this.Count.cInp, this.Count.cRej, this.Count.cCom], label:'Customer Master',backgroundColor:'#dfb44e'}]
        //     },
        //     options: {
        //       title: {
        //         display: true,
        //         text: 'Master Wise Status'
        //       },
        //       legend: {
        //         display: true
        //       },
        //       scales: {
        //         yAxes: [{
        //           ticks: {
        //             beginAtZero: true,
        //             callback: function (value:any) { if (Number.isInteger(value)) { return value; } }
        //             //stepSize: 1,
        //           }
        //         }]
        //       },
        //       plugins: {
        //         datalabels: {
        //           color: 'black',
        //           font: {
        //             size: 12,
        //             weight: 600
        //           },
        //           offset: 4,
        //           padding: 0,
        //           // formatter: function(value) {
        //           //   return value;
        //           // }
        //         }
        //       }
        //     }
        //   });
    }
   
  
   
  }
}
