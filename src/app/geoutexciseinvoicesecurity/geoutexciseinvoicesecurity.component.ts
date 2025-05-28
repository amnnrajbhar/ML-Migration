import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
declare var jQuery: any;
import * as _ from "lodash";
import { Router, ActivatedRoute } from '@angular/router';
import { APIURLS } from '../shared/api-url';
import { AppComponent } from '../app.component';
import { HttpService } from '../shared/http-service';
import { AuthData } from '../auth/auth.model';
import { GateOutwardMaster } from '../gateentrymodels/gateoutwardm.model';
import { GateOutwardD } from '../gateentrymodels/gateoutwardd.model';
import { FormControl } from '@angular/forms';
import { Location } from '../masters/employee/location.model';
import { GateEntryHeader } from '../gateentry/gateentryheader.model';
import { GateEntryMaterial } from '../gateentry/gateentrymaterial.model';
import { GEPOInputs } from '../gateentry/gepoinputs.model';
import { GenericGateEntryM } from '../gateentry/genericgateentrym.model';
import swal from 'sweetalert';
declare var $: any;

@Component({
  selector: 'app-geoutexciseinvoicesecurity',
  templateUrl: './geoutexciseinvoicesecurity.component.html',
  styleUrls: ['./geoutexciseinvoicesecurity.component.css']
})
export class GeOutExciseInvoiceSecurityComponent implements OnInit {

 @ViewChild('userForm', { static: false }) userForm: any;

  searchTerm = new FormControl();
  currentUser!: AuthData;
  tableWidget: any;
  path!: string
  fiscalYear: string
  errMsg: string = "";
  errMsgPop: string = "";
  errMsgModalPop: string = "";
  isEdit!: boolean;
  isLoading!: boolean;
  isLoadingPop!: boolean;
  isLoadingBAPI!: boolean;
  gateOutwardMModel = {} as GateOutwardMaster;
  gateOutwardDModel = {} as GateOutwardD;
  gateEntryHeaderModel = {} as GateEntryHeader;
  gateOutwardMList: GateOutwardMaster[] = [];
  gateOutwardDList: GateOutwardD[] = [];
  pO_No: string
  qtY_RCVD: any;
  entryDateTime: Date = new Date();
  OUT_TIME: any;
  reason: string
  gONo: string
  sendingPersonName:string;

  elementtype:string;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) { }

  ngOnInit() {
    this.path = this.router.url;
    var today = new Date();

    this.elementtype="svg";
    // this.fiscalYear = today.getFullYear() + '-' + (today.getFullYear() + 1).toString().substr(-2);
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.getLocationById(this.currentUser.baselocation);
      this.getPlantsassigned(this.currentUser.fkEmpId);
      this.getGateList();
      this.getLocationList();
      this.getDepartmentList();
      this.getEmployeeList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }
  ngAfterViewInit() {
    this.initDatatable();
  }
  private initDatatable(): void {
    let table: any = jQuery('#userTable');
    this.tableWidget = table.DataTable({
      "destroy": true,
      "columnDefs": [
        { "orderable": false, "targets": 8 }
      ]
    });
  }
  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy()
      this.tableWidget = null
    }
    setTimeout(() => this.initDatatable(), 0)
  }

  getGONumInfo(gONo) {
    this.resetForm();
    this.gONo = gONo;
    if (gONo == null || gONo == '') {
      swal({
        title: "Message",
        text: "Please enter GO Number",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      });
    }
    else {
      this.isLoadingBAPI = true;
      var genericGateEntryM = {} as GenericGateEntryM;
      genericGateEntryM.gI_TYPE = 'E';
      genericGateEntryM.gI_NO = this.gONo;
      genericGateEntryM.planT_ID = this.plant;
      this.httpService.post(APIURLS.BR_MASTER_GATEOUTWARDM_FILTER_API, genericGateEntryM).then((data: any) => {
        if (data) {
          let goData = data.filter((item: any) => {
            return (item.gO_TYPE == "E" && item.isActive);
          });
          if (goData.length > 0) {
          if(goData[0].status == "Pending For Approval")
          {
            swal({
              title: "Message",
              text: "Entered GO No is Pending For Approval",
              icon: "warning",
              dangerMode: false,
              buttons: [false, true]
            });
          }
          else if (goData[0].ouT_TIME != null) {
              swal({
                title: "Message",
                text: "Entered GO No already checked out.Please enter different GO Number",
                icon: "warning",
                dangerMode: false,
                buttons: [false, true]
              });
            }
            else {
              this.gateOutwardMModel = goData[0];
              this.sendingPERSON = this.employeeList.find((x:any)  => x.employeeId == this.gateOutwardMModel.sendinG_PERSON);
              this.sendingPersonName = this.gateOutwardMModel.sendingPersonName;
              // this.sendingPersonName=this.sendingPERSON.firstName +' '+this.sendingPERSON.middleName +' '+ this.sendingPERSON.lastName;
              this.sendingDEPTNAME = this.departmentList.find((x:any)  => x.name == this.gateOutwardMModel.sendinG_DEPT_NM);
              this.fiscalYear = this.gateOutwardMModel.fiN_YEAR;
              this.getOutWardMaterial(this.gateOutwardMModel.id);
            }
          }
          else {
            swal({
              title: "Message",
              text: "Entered GO Number does not belongs to this location.Please enter correct GO Number",
              icon: "warning",
              dangerMode: false,
              buttons: [false, true]
            });
          }
        }
        this.isLoadingBAPI = false;
      }).catch((error)=> {
        this.isLoadingBAPI = false;
        this.gateOutwardMModel = {} as GateOutwardMaster;
      });
    }
  }
  getOutWardMaterial(fkHId) {
    this.httpService.getById(APIURLS.BR_MASTER_GATEOUTWARDD_ANY_API, fkHId).then((data: any) => {
      this.isLoadingBAPI = true;
      if (data) {
        data.forEach((mtrl:any) => {
          this.gateOutwardDList = data;
        });
      }
      this.isLoadingBAPI = false;
    }).catch((error)=> {
      this.isLoadingBAPI = false;
      this.gateOutwardDList = [];
    });
  }
  plantList:any[]=[];
  location:any[]=[]; 
  baseloc={fkPlantId:0,code:'',name:''}
  getPlantsassigned(id:any)
  {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.plantList = data;  
        let temp=this.plantList.find(x=>x.fkPlantId == this.currentUser.baselocation);
        if(temp == null || temp == undefined)
        {
          this.location.forEach((element:any)=> {

            this.baseloc.fkPlantId=element.id;
            this.baseloc.code=element.code;
            this.baseloc.name=element.name;
          });
          this.plantList.push(this.baseloc);
        }    
       this.plant=this.plantList.find(x=>x.fkPlantId == this.currentUser.baselocation).code;   
      }
      
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.plantList = [];
    });
  }
  locationName: string
  plant!: string
  getLocationById(lId: number) {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_LOCATION_MASTER_API, lId).then((data: any) => {
      if (data) {
        this.plant = data.code;
        this.locationName = data ? data.code + '-' + data.name : '';
        this.loadGateOutwardList('load');
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.plant = '';
      this.locationName = '';
    });
  }
  locationGateList = [];
  selGateLocation: any;
  getGateList() {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_LOCATIONGATE_MASTER_ANY_API, this.currentUser.baselocation).then((data: any) => {
      if (data.length > 0) {
        this.locationGateList = data;
        this.selGateLocation = this.locationGateList.find((x:any)  => x.gateNo == '1');
        // this.selGateLocation = this.locationGateList.find((x:any)  => x.gateNo == 'G1');
        // this.gateNo = this.selGateLocation.id;
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.locationGateList = [];
    });
  }
  locationList: any;
  selDestination: any;
  getLocationList() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data) {
        this.locationList = data;
        this.selDestination = null;
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.locationList = [];
    });
  }
  employeeList = [];
  sendingPERSON: any;
  getEmployeeList() {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_EMPLOYEEMASTER_GETBY_ANY_API,this.currentUser.baselocation).then((data: any) => {
      if (data.length > 0) {
        this.employeeList = data.map((i:any) => { i.empfull = i.firstName + ' ' + i.middleName + ' ' + i.lastName + '-' + i.employeeId + '-' + i.designation; return i; });
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.employeeList = [];
    });
  }
  departmentList = [];
  sendingDEPTNAME: any;
  getDepartmentList() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data;
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.departmentList = [];
    });
  }
  //Search Filters
  dropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  deliveryModeList = [
    { id:0, name: 'In Person' },
    { id:1,name: 'Courier' },
    { id:2,name: 'Vehicle' }
  ]
  selectedModes: any = null;
  onItemDeSelect(item: any) {
  }
  onDeSelectAll(items: any) {
    this.selectedModes = [];
  }
  onSelectAll(items: any) {
    this.selectedModes = items;
  }
  clearFilter() {
    this.from_date= new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    this.to_date = this.today;
    this.delete = false;
    this.fltrGONO = null;
    this.fltrInvoiceNo = null;
    this.fltrDCNO=null;
    this.selectedModes = [];
  }
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  delete: boolean = false;
  fltrGONO: string
  fltrInvoiceNo: string
  fltrDCNO: string
  loadGateOutwardList(action) {
    this.isLoading = true;
    var genericGateEntryM = {} as GenericGateEntryM;
    genericGateEntryM.planT_ID = this.plant;
    genericGateEntryM.gI_TYPE = 'E';
    if (this.from_date != null)
      genericGateEntryM.fromdate = this.getDateFormate(this.from_date);
    if (this.to_date != null)
      genericGateEntryM.todate = this.getDateFormate(this.to_date);
    genericGateEntryM.isActive = this.delete ? '0' : '1';
    genericGateEntryM.gI_NO = this.fltrGONO;
    genericGateEntryM.doC_NO = this.fltrInvoiceNo;
    genericGateEntryM.ack = this.fltrDCNO;
    if (this.selectedModes != null) {
      let delmodes = null;
      this.selectedModes.forEach(mode => {
        delmodes = mode.name + ',' + delmodes;
      });
      genericGateEntryM.deliverymode = delmodes;
    }
    this.httpService.post(APIURLS.BR_MASTER_GATEOUTWARDM_FILTER_API, genericGateEntryM).then((data: any) => {
      if (data) {
        // this.gateOutwardMList = data.filter((item: any) => {
        //   return item.ouT_TIME != null && item.persoN_NAME==this.currentUser.employeeId;
        // });
        this.gateOutwardMList = data;
        this.gateOutwardMList.reverse();
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.gateOutwardMList = [];
    });
    if (action == 'print') {
      this.onGateEntryActions(true,this.gateOutwardMModel,true);
    }
  }
  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }
  getGoNO(gONO: string):string{
    return gONO!=null?gONO.toString().padStart(4, '0').toString():'';
  }
  onGateEntryActions(isedit: boolean, gateOutwardM: GateOutwardMaster, isprint: boolean) {
    this.isEdit = isedit;
    this.userForm.form.markAsPristine();
    this.userForm.form.markAsUntouched();
    this.userForm.form.updateValueAndValidity();
    this.resetForm();
    if (isedit) {
      this.gateOutwardMModel = gateOutwardM;
      let postedlocation = this.locationList.find((x:any)  => x.code == this.gateOutwardMModel.planT_ID);
      this.locationName = postedlocation ? postedlocation.code + '-' + postedlocation.name : '';
      this.selGateLocation = this.locationGateList.find((x:any)  => x.gateNo == this.gateOutwardMModel.gO_GATENO);
      this.sendingPERSON = this.employeeList.find((x:any)  => x.employeeId == this.gateOutwardMModel.sendinG_PERSON);
      this.sendingPersonName = this.gateOutwardMModel.sendingPersonName;
      // this.sendingPersonName=this.sendingPERSON.firstName +' '+this.sendingPERSON.middleName +' '+ this.sendingPERSON.lastName;
      this.sendingDEPTNAME = this.departmentList.find((x:any)  => x.name == this.gateOutwardMModel.sendinG_DEPT_NM);
      this.fiscalYear = this.gateOutwardMModel.fiN_YEAR;
      var loc = this.plantList.find(x=>x.code == this.gateOutwardMModel.planT_ID)
      this.locationName=loc.code +'-'+loc.name;
      if (this.gateOutwardMModel.ouT_TIME != null)
        this.OUT_TIME = this.gateOutwardMModel.ouT_TIME;
      this.httpService.getById(APIURLS.BR_MASTER_GATEOUTWARDD_ANY_API, gateOutwardM.id).then((data: any) => {
        if (data) {
          this.gateOutwardDList = data;
        }
      }).catch((error)=> {
        this.gateOutwardDList = [];
      });
    }
    if (isprint) {
      jQuery("#printModal").modal('show');
    }
    else {
      jQuery("#myModal").modal('show');
    }
  }

  resetForm(): void {
    this.entryDateTime = new Date();
    this.gateOutwardMModel = {} as GateOutwardMaster;
    this.gateOutwardDModel = {} as GateOutwardD;
    this.gateOutwardDList = [];
    //this.selGateLocation = null;
    this.errMsgPop = '';
    this.errMsg = ''
    this.errMsgModalPop = '';
    this.reason = '';
    this.selDestination = null;
    this.sendingPERSON = null;
    this.sendingDEPTNAME = null;
    this.isLoadingPop = false;
    this.isLoadingBAPI = false;
    this.OUT_TIME = new Date();
    this.gONo='';

    this.gateOutwardMModel.deliverymode=null;
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
  onSaveEntry() {
    swal({
      title: "Are you sure to submit?",
      icon: "warning",
      buttons: [true, true],
      dangerMode: false,
    })
      .then((willsave) => {
        if (willsave) {
          this.gateOutwardMModel.gO_GATENO = this.selGateLocation.gateNo;
          this.gateOutwardMModel.persoN_NAME = this.currentUser.employeeId;
          this.gateOutwardMModel.ouT_TIME = this.getFormatedDateTime(this.OUT_TIME);
          this.gateOutwardMModel.ouT_DATE = this.getDateFormate(this.OUT_TIME);
          this.gateOutwardMModel.modifieD_BY = this.currentUser.employeeId;
          this.gateOutwardMModel.courier_Date =this.gateOutwardMModel.courier_Date?this.getDateFormate(this.gateOutwardMModel.doC_DATE):null;
          this.gateOutwardMModel.modifieD_DATE = this.getFormatedDateTime(new Date());
          let connection = this.httpService.put(APIURLS.BR_MASTER_GATEOUTWARDM_POST_API, this.gateOutwardMModel.id, this.gateOutwardMModel);
          connection.then((data: any) => {
            this.isLoadingPop = true;
            if (data == 200 || data.id > 0) {
              jQuery('#myModal').modal('hide');
              this.errMsgModalPop = 'Saved successfully!';
              swal(this.errMsgModalPop, {
                icon: "success",
              }).then((x) => {
                if (x) {
                  this.loadGateOutwardList('print');
                }
              });
            }
            this.isLoadingPop = false;
          }).catch((error)=> {
            this.isLoadingPop = false;
            this.errMsgPop = 'Error Gate Entry System...';
          });
        }
      });
  }
  print(): void {
    let printContents, popupWin;
    printContents = document.getElementById('print-section').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>Outward - Sales</title>
          <link rel="stylesheet" type="text/css" href="assets/custom/print.css" />
          <link rel="stylesheet" type="text/css" href="assets/bootstrap/css/bootstrap.min.css" />
        </head>
        <body onload="window.print();window.close()">
        <table class="report-container">
          <thead class="report-header">
            <tr>
              <th class="report-header-cell">
                <div class="header-info">
                  Print Date: ${new Date().toLocaleDateString('en-GB')}  Printed By: ${this.currentUser.fullName}
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="report-content">
            <tr>
              <td class="report-content-cell">
                <div class="main">
                ${printContents}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        </body>
      </html>`
    );
    popupWin.document.close();
  }

}
