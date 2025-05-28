import { Component, OnInit, ViewChild } from '@angular/core';
import * as _ from "lodash";
import { Router } from '@angular/router';
import { APIURLS } from '../shared/api-url';
import { AppComponent } from '../app.component';
import { HttpService } from '../shared/http-service';
import { AuthData } from '../auth/auth.model';
import { FormControl } from '@angular/forms';
import { GateOutwardMaster } from '../gateentrymodels/gateoutwardm.model';
import swal from 'sweetalert';
import { GateEntryM } from '../gateentry/gateentrym.model';
import { GateEntryD } from '../gateentry/gateentryd.model';
import { GenericGateEntryM } from '../gateentry/genericgateentrym.model';
import { RFCCreateGEPO } from '../gateentry/rfccreategepo.model';
declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-geinreturnablemat',
  templateUrl: './geinreturnablemat.component.html',
  styleUrls: ['./geinreturnablemat.component.css']
})
export class GEInReturnableMatComponent implements OnInit {
 @ViewChild('userForm', { static: false }) userForm: any;
@ViewChild('depForm', { static: false }) depForm: any;

 

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
  gateEntryMModel = {} as GateEntryM;
  gateEntryDModel = {} as GateEntryD;
  gateEntryMList: GateEntryM[] = [];
  gateEntryDList: GateEntryD[] = [];
  gateOutwardMModel = {} as GateOutwardMaster;
  // gateOutwardDModel = {} as GateOutwardD;
  gateOutwardMList: GateOutwardMaster[] = [];
  // gateOutwardDList: GateOutwardD[] = [];
  pO_No: string
  qtY_RCVD: any;
  entryDateTime: Date = new Date();
  userName: string
  iN_TIME: any;
  reason: string
  gateNo: string
  gONo: string
  sendingPersonName: string
  max: Date = new Date();

  elementtype:string;
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) { }
  getCurrentFinancialYear() {
    var fiscalyear = "";
    var today = new Date();
    if ((today.getMonth() + 1) <= 3) {
      fiscalyear = (today.getFullYear() - 1) + "-" + today.getFullYear().toString().substr(-2);
    } else {
      fiscalyear = today.getFullYear() + "-" + (today.getFullYear() + 1).toString().substr(-2);
    }
    return fiscalyear
  }
  ngOnInit() {
    this.path = this.router.url;
    var today = new Date();
    this.elementtype="svg";
    this.fiscalYear = this.getCurrentFinancialYear();
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.userName = this.currentUser.fullName;
      this.getGateList();
     //this.getPlantsassigned(this.currentUser.fkEmpId);
      this.getLocationById(this.currentUser.baselocation);
      this.getEmployeeList();


    }
    else
      this.router.navigate(["/unauthorized"]);
  }
  locationGateList = [];
  selGateLocation: any;
  getGateList() {
    this.httpService.getById(APIURLS.BR_MASTER_LOCATIONGATE_MASTER_ANY_API, this.currentUser.baselocation).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.locationGateList = data;
        this.selGateLocation = this.locationGateList.find((x:any)  => x.gateNo == '1');
      }
      this.isLoading = false;
    }).catch((error) => {
      this.isLoading = false;
      this.locationGateList = [];
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
  goNoAutocomplete() {
    var self = this;
    $('#gono').autocomplete({
      source: function (request:any, response:any) {
        var searchTerm = '2' + ',' + request.term + ',' + self.plant;
        let connection = self.httpService.getByParam(APIURLS.BR_MASTER_GATEOUTWARDM_PARAM_API, searchTerm);
        connection.then((data: any) => {
          if (data) {
            let result = data;
            response(result.map((i:any) => { i.label = i.gO_NO + '-' + i.destinatioN_NM, i.val = i.gO_NO; return i; }));
          }
        }).catch((error)=> {
        });
      },
      select: function (event:any, ui:any) {
        self.gONo = ui.item.val;
        return false;
      }
    });
  }
  ngAfterViewInit() {
    this.initDatatable();
  }
  private initDatatable(): void {
    let table: any = jQuery('#userTable');
    this.tableWidget = table.DataTable({
      "destroy": true,
      "columnDefs": [
        { "orderable": false, "targets": 9 }
      ]
    });
  }
  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy();
      this.tableWidget = null;
    }
    setTimeout(() => this.initDatatable(), 0)
  }
  locationName: string
  plant!: string
  plantList:any[]=[];
  location:any[]=[];
  getLocationById(lId: number) {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_LOCATION_MASTER_API, lId).then((data: any) => {
      if (data) {
        this.location.push(data);
        this.locationName = data ? data.code + '-' + data.name : '';
        this.getPlantsassigned(this.currentUser.fkEmpId);
        this.plant=data.code;
        this.getAllGateEntries("load");  
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.plant = '';
      this.locationName = '';
    });
  }

  lastReportingkeydown = 0;
  getpersonResponsible($event, i) {
    let self = this;
    let text = $('#persoN_NAME').val();
    if (text.length > 3) {
      if ($event.timeStamp - this.lastReportingkeydown > 400) {
        this.httpService.get(APIURLS.BR_GET_EMPLOYEE_BASED_ON_SEARCHTEXT + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return {
                label: item.fullName + " (" + item.employeeId + ")", value: item.employeeId, name: item.name, mobile: item.mobileNo,
                email: item.emailId, plant: item.plant
              };
            })
            $('#persoN_NAME').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#persoN_NAME").val(ui.item.name);
                  self.gateEntryMModel.persoN_NAME=ui.item.name;

                }
                else {
                  $("#persoN_NAME").val('');
                }
              },
              select: function (event:any, ui:any) {
                if (ui.item) {
                  $("#persoN_NAME").val(ui.item.name);
                  self.gateEntryMModel.persoN_NAME=ui.item.name;

                }
                else {
                  $("#persoN_NAME").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastReportingkeydown = $event.timeStamp;
    }
  }
  
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
       //this.getAllGateEntries("load");   
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.plantList = [];
    });
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
    this.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    this.to_date = this.today;
    this.acknowledge = false;
    this.delete = false;
    this.fltrGINO = null;
    this.fltrInvoice = null;
    this.gIacknowledge = null;
    this.selectedModes = [];
  }
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  acknowledge: boolean = false;
  delete: boolean = false;
  fltrGINO: string
  fltrInvoice: string
  gIacknowledge: any = null;
  getAllGateEntries(msg) {
    this.isLoading = true;
    var genericGateEntryM = {} as GenericGateEntryM;
    genericGateEntryM.planT_ID = this.plant;
    genericGateEntryM.gI_TYPE = '2';
    genericGateEntryM.gI_NO = this.fltrGINO;
    genericGateEntryM.doC_NO = this.fltrInvoice;
    if (this.selectedModes != null) {
      let delmodes = null;
      this.selectedModes.forEach(mode => {
        delmodes = mode.name + ',' + delmodes;
      });
      genericGateEntryM.deliverymode = delmodes;
    }
    if (this.from_date != null)
      genericGateEntryM.fromdate = this.getDateFormate(this.from_date);
    if (this.to_date != null)
      genericGateEntryM.todate = this.getDateFormate(this.to_date);
    genericGateEntryM.isActive = this.delete ? '0' : '1';
    genericGateEntryM.ack = this.acknowledge ? '0' : '';
    genericGateEntryM.isack = this.gIacknowledge;
    this.httpService.post(APIURLS.BR_MASTER_GATEINWARDM_GETGEGATEPO_API, genericGateEntryM).then((data: any) => {
      if (data) {
        this.gateEntryMList = data;
        this.gateEntryMList.reverse();
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch((error) => {
      this.isLoading = false;
      this.gateEntryMList = [];
    });
    if (msg == 'print') {
      this.onGateEntryActions(true, this.gateEntryMModel, 'print');
    }
  }
  keyPressNumber(evt:any) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 32 && (charCode < 48 || charCode > 57)) {

      return false;
    }
    return true;
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
      this.getInwardReturnMaterials(gONo);
      var genericGateEntryM = {} as GenericGateEntryM;
      genericGateEntryM.gI_TYPE = '2';
      genericGateEntryM.gI_NO = this.gONo;
      genericGateEntryM.planT_ID = this.plant;
      genericGateEntryM.isActive = '1';
      this.httpService.post(APIURLS.BR_MASTER_GATEOUTWARDM_FILTER_API, genericGateEntryM).then((data: any) => {
        if (data) {
          let goData = data.filter((item: any) => {
            return item.gO_TYPE == "2" && item.ouT_TIME != null;
          });
          if (goData.length > 0) {
            if (goData[0].gO_FLG != 'Y') {
              this.gateOutwardMModel = goData[0];
              this.sendingPERSON = this.employeeList.find((x:any)  => x.employeeId == this.gateOutwardMModel.sendinG_PERSON);
              this.sendingPersonName = this.sendingPERSON.firstName + ' ' + this.sendingPERSON.middleName + ' ' + this.sendingPERSON.lastName;
              this.getOutWardMaterial(this.gateOutwardMModel.id);
            }
            else {
              swal({
                title: "Message",
                text: "This GO No is closed",
                icon: "warning",
                dangerMode: false,
                buttons: [false, true]
              });
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
      }).catch((error) => {
        this.isLoadingBAPI = false;
        this.gateOutwardMModel = {} as GateOutwardMaster;
      });
    }
  }
  getOutWardMaterial(fkHId) {
    this.isLoadingBAPI = true;
    this.httpService.getById(APIURLS.BR_MASTER_GATEOUTWARDD_ANY_API, fkHId).then((data: any) => {
      if (data) {
        this.gateEntryDList = data.map(t => { t.qtY_RCVD = t.qtY_RCVD ? t.qtY_RCVD : 0; return t; });
      }
      this.isLoadingBAPI = false;
    }).catch((error) => {
      this.isLoadingBAPI = false;
      this.gateEntryDList = [];
    });
  }
  exReturnMaterialsList: GateEntryD[] = [];
  totalMaterialQTY: any;
  getInwardReturnMaterials(gONo) {
    var genericGateEntryM = {} as GenericGateEntryM;
    genericGateEntryM.gI_TYPE = '2';
    genericGateEntryM.gI_NO = gONo;
    this.httpService.post(APIURLS.BR_MASTER_GATEINWARDD_VALRECQTY_API, genericGateEntryM).then((data: any) => {
      if (data) {
        this.exReturnMaterialsList = data;
        if (this.exReturnMaterialsList) {
          this.totalMaterialQTY = this.exReturnMaterialsList.map(t => t.qty).reduce((a, value) => a + value, 0) - this.exReturnMaterialsList.map(t => t.qtY_RCVD).reduce((a, value) => a + value, 0);
        }
      }
    }).catch((error) => {
      this.exReturnMaterialsList = [];
    });
  }
  gINo: string
  getGINumInfo(gINo) {
    this.resetForm();
    this.gINo = gINo;
    if (this.gINo == null) {
      swal({
        title: "Message",
        text: "Please enter GI Number",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      });
    }
    else {
      this.isLoadingBAPI = true;
      var genericGateEntryM = {} as GenericGateEntryM;
      genericGateEntryM.gI_TYPE = '2';
      genericGateEntryM.gI_NO = this.gINo;
      genericGateEntryM.planT_ID = this.plant;
      this.httpService.post(APIURLS.BR_MASTER_GATEINWARDM_GETGEGATEPO_API, genericGateEntryM).then((data: any) => {
        if (data) {
          let giData = data.filter((item: any) => {
            return item.gI_TYPE == "2";
          });
          if (giData.length > 0) {
            if (giData[0].receiveD_DATE != null) {
              swal({
                title: "Message",
                text: "Entered GI Number is already acknowledged.",
                icon: "warning",
                dangerMode: false,
                buttons: [false, true]
              });
            }
            else {
              this.gateEntryMModel = giData[0];
              this.getGIMaterialDetails(this.gateEntryMModel.id);
              this.getInwardReturnMaterials(this.gateEntryMModel.gO_NO);
              var genericGateEntryM = {} as GenericGateEntryM;
              genericGateEntryM.gI_TYPE = '2';
              genericGateEntryM.gI_NO = this.gateEntryMModel.gO_NO;
              this.httpService.post(APIURLS.BR_MASTER_GATEOUTWARDM_FILTER_API, genericGateEntryM).then((data: any) => {
                if (data) {
                  this.gateOutwardMModel = data[0];
                  this.sendingPERSON = this.employeeList.find((x:any)  => x.employeeId == this.gateOutwardMModel.sendinG_PERSON);
                  this.sendingPersonName = this.sendingPERSON.firstName + ' ' + this.sendingPERSON.middleName + ' ' + this.sendingPERSON.lastName;
                }
              }).catch((error)=> {
                this.isLoadingBAPI = false;
              });
            }
          }
          else {
            swal({
              title: "Message",
              text: "Please enter valid GI Number",
              icon: "warning",
              dangerMode: false,
              buttons: [false, true]
            });
          }
        }
        this.isLoadingBAPI = false;
      }).catch((error)=> {
        this.isLoadingBAPI = false;
      });
    }
  }

  getGIMaterialDetails(fkID) {
    this.httpService.getById(APIURLS.BR_MASTER_GATEINWARDD_ANY_API, fkID).then((data: any) => {
      this.isLoadingBAPI = true;
      if (data) {
        this.gateEntryDList = data;
        this.isLoadingBAPI = false;
      }
    }).catch((error)=> {
      this.isLoadingBAPI = false;
      this.gateEntryDList = [];
    });
  }
  onGateEntryActions(isedit: boolean, gateEntryM: GateEntryM, action: string) {
    this.isEdit = isedit;
    this.resetForm();
    if (action == 'search') {
      this.depForm.form.markAsPristine();
      this.depForm.form.markAsUntouched();
      this.depForm.form.updateValueAndValidity();
    }
    else {
      this.userForm.form.markAsPristine();
      this.userForm.form.markAsUntouched();
      this.userForm.form.updateValueAndValidity();
    }
    if (isedit) {
      this.gateEntryMModel = Object.assign({}, gateEntryM);
      var genericGateEntryM = {} as GenericGateEntryM;
      genericGateEntryM.gI_TYPE = '2';
      genericGateEntryM.gI_NO = gateEntryM.gO_NO;
      this.httpService.post(APIURLS.BR_MASTER_GATEOUTWARDM_FILTER_API, genericGateEntryM).then((data: any) => {
        if (data) {
          this.gateOutwardMModel = data[0];
          this.sendingPERSON = this.employeeList.find((x:any)  => x.employeeId == this.gateOutwardMModel.sendinG_PERSON);
          this.sendingPersonName = this.sendingPERSON.firstName + ' ' + this.sendingPERSON.middleName + ' ' + this.sendingPERSON.lastName;
        }
      }).catch((error) => {
        this.gateOutwardMModel = {} as GateOutwardMaster;
      });
      //this.entryDateTime = gateEntryM.gI_DATE;
      this.selGateLocation = this.locationGateList.find((x:any)  => x.gateNo == gateEntryM.gI_GATENO);
      this.gateNo = this.selGateLocation.gateNo;
      this.fiscalYear = gateEntryM.fiN_YEAR;
      this.iN_TIME = gateEntryM.iN_TIME;
      //let enteredBY = this.employeeList.find((x:any)  => x.employeeId == gateEntryM.persoN_NAME);
      this.userName = gateEntryM.persoN_NAME;//enteredBY.firstName + ' ' + enteredBY.middleName + ' ' + enteredBY.lastName;
      this.httpService.getById(APIURLS.BR_MASTER_GATEINWARDD_ANY_API, gateEntryM.id).then((data: any) => {
        if (data.length > 0) {
          this.gateEntryDList = data;
        }
      }).catch((error) => {
        this.gateEntryDList = [];
      });
    }
    if (action == 'print') {
      jQuery("#printModal").modal('show');
    }
    else if (action == 'search') {
      jQuery("#depModal").modal('show');
    }
    else {
      jQuery("#myModal").modal('show');
    }
  }

  resetForm(): void {
    this.entryDateTime = new Date();
    this.iN_TIME = new Date();
    this.userName = this.currentUser.fullName;
    this.gateEntryMModel = {} as GateEntryM;
    this.gateEntryDModel = {} as GateEntryD;
    this.gateOutwardMModel = {} as GateOutwardMaster;
    this.lstgateEntryD = [];
    this.gateEntryDList = [];
    this.exReturnMaterialsList = [];
    this.errMsgPop = '';
    this.errMsg = ''
    this.errMsgModalPop = '';
    this.reason = '';
    this.gONo = '';
    this.gINo = '';
    //this.selGateLocation = null;
    this.isLoadingBAPI = false;
    this.isLoadingPop = false;
    this.sendingPersonName = '';
    this.goNoAutocomplete();
  }
  totalRecQTY: any;
  totalremQTY: any;
  onSaveEntry() {
    if (!this.isEdit) {
      this.totalremQTY = this.gateEntryDList.map(t => t.qty).reduce((a, value) => a + value, 0) - this.gateEntryDList.map(t => t.qtY_RCVD).reduce((a, value) => a + value, 0);
      this.totalRecQTY = this.gateEntryDList.map(t => t.qtY_RCVD ? t.qtY_RCVD : 0).reduce((a, value) => a + value, 0);
      //  console.log(this.exReturnMaterialsList.length);
      //  console.log(this.totalMaterialQTY);
      //  console.log(this.totalRecQTY);
      let zeroQTYMatList = this.gateEntryDList.filter((x:any)  => { return x.qtY_RCVD <= 0 });
      if (zeroQTYMatList.length == this.gateEntryDList.length) {
        swal({
          title: "Message",
          text: "Please enter quatity.",
          icon: "warning",
          dangerMode: false,
          buttons: [false, true]
        });
      }
      else {
        swal({
          title: "Are you sure to submit?",
          icon: "warning",
          buttons: [true, true],
          dangerMode: false,
        })
          .then((willsave) => {
            if (willsave) {
              this.insertGateEntry();
            }
          });
      }
    }
    else {
      swal({
        title: "Are you sure to Cancel Entry?",
        icon: "warning",
        buttons: [true, true],
        dangerMode: false,
      })
        .then((willsave) => {
          if (willsave) {
            this.deleteGateEntry();
          }
        });
    }
  }
  lstgateEntryD: GateEntryD[] = [];
  insertGateEntry() {
    var dtinTime = new Date(this.iN_TIME);
    this.gateEntryMModel.mandt = '450'
    this.gateEntryMModel.fiN_YEAR = this.fiscalYear;
    this.gateEntryMModel.planT_ID = this.plant
    this.gateEntryMModel.gI_GATENO = this.selGateLocation.gateNo;
    this.gateEntryMModel.gI_TYPE = '2';
    this.gateEntryMModel.gO_NO = this.gateOutwardMModel.gO_NO;
    this.gateEntryMModel.doC_NO = this.gateOutwardMModel.doC_NO;
    this.gateEntryMModel.doC_DATE = this.getDateFormate(this.gateOutwardMModel.doC_DATE);
    this.gateEntryMModel.gI_DATE = this.getDateFormate(dtinTime);
    var inTime = ("00" + dtinTime.getHours()).slice(-2) + ":" +
      ("00" + dtinTime.getMinutes()).slice(-2) + ":" +
      ("00" + dtinTime.getSeconds()).slice(-2);
    this.gateEntryMModel.iN_TIME = inTime;
   // this.gateEntryMModel.persoN_NAME = this.userName;
    this.gateEntryMModel.createD_BY = this.currentUser.employeeId;
    this.gateEntryMModel.createD_DATE = this.getFormatedDateTime(new Date());
    this.gateEntryMModel.courier_Date =this.gateEntryMModel.courier_Date?this.getDateFormate(this.gateEntryMModel.doC_DATE):null;
    this.gateEntryMModel.isActive = true;
    //Insert Material
    var index = 0;

    this.gateEntryDList.forEach((mtrl:any) => {
      index = index + 1;
      if (mtrl.qtY_RCVD && mtrl.qtY_RCVD > 0) {
        this.gateEntryDModel = {} as GateEntryD;
        this.gateEntryDModel.mandt = '450'
        this.gateEntryDModel.fiN_YEAR = this.fiscalYear;
        this.gateEntryDModel.planT_ID = this.plant
        this.gateEntryDModel.gI_GATENO = this.selGateLocation.gateNo;
        this.gateEntryDModel.iteM_NO = index;
        this.gateEntryDModel.iteM_CODE = mtrl.iteM_CODE;
        this.gateEntryDModel.materiaL_TYPE = mtrl.materiaL_TYPE;
        this.gateEntryDModel.iteM_DESC = mtrl.iteM_DESC;
        this.gateEntryDModel.uom = mtrl.uom;
        this.gateEntryDModel.nO_OF_CASES = mtrl.nO_OF_CASES;
        this.gateEntryDModel.qty = mtrl.qty;
        this.gateEntryDModel.qtY_RCVD = mtrl.qtY_RCVD;
        this.gateEntryDModel.createD_BY = this.currentUser.employeeId;
        this.gateEntryDModel.createD_DATE = this.getDateFormate(new Date());
        this.gateEntryDModel.isActive = true;
        this.lstgateEntryD.push(this.gateEntryDModel);
      }
    });
    this.gateEntryMModel.gateEntryDViewModel = this.lstgateEntryD;
    let connection = this.httpService.post(APIURLS.BR_MASTER_GATEINWARDM_POST_API, this.gateEntryMModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        if (this.exReturnMaterialsList.length > 0) {
          if (this.totalMaterialQTY == this.totalRecQTY) {
            this.updateOutWardAcknowledge();
          }
        }
        else if (this.totalremQTY == 0) {
          this.updateOutWardAcknowledge();
        }
        this.sendGEPOtoCreateBAPI(data);
      }
    }).catch((error) => {
      this.errMsgPop = 'Error saving Header...';
      this.isLoadingPop = false;
    });
  }
  sendGEPOtoCreateBAPI(model) {
    this.gateEntryMModel = Object.assign({}, model);
    this.lstgateEntryD.forEach((x:any)  => {
      x.gI_NO = model.gI_NO;
    });
    let rfcCreateGEPO = {} as RFCCreateGEPO;
    rfcCreateGEPO.gateEntryInputs = this.gateEntryMModel;
    rfcCreateGEPO.gateEntryMaterial = this.lstgateEntryD;
    let connection = this.httpService.post(APIURLS.BR_RFCBAPI_CREATEGEPO_API, rfcCreateGEPO);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      jQuery('#myModal').modal('hide');
      if (data != null) {
        if (data.message == 'SUCESSFULLY INSERTED' || data.type == 'X') {
          this.updateACKinGEPO(model);
          this.errMsgModalPop = 'Saved successfully!';
          swal(this.errMsgModalPop, {
            icon: "success",
          }).then((willsave) => {
            if (willsave) {
              this.getAllGateEntries('print');
            }
          });
        }
        else {
          this.errMsgModalPop = 'Successfully inserted in gate entry system,Could not connect to SAP';
          swal(this.errMsgModalPop, {
            icon: "warning",
          }).then((willsave) => {
            if (willsave) {
              this.getAllGateEntries('print');
            }
          });
        }
      }
      else {
        this.errMsgModalPop = 'Successfully inserted in gate entry system,Could not connect to SAP';
        swal(this.errMsgModalPop, {
          icon: "warning",
        }).then((willsave) => {
          if (willsave) {
            this.getAllGateEntries('print');
          }
        });
      }
      this.isLoadingPop = false;
    }).catch((error)=> {
      this.errMsgPop = 'Successfully inserted in gate entry system,Could not connect to SAP';
      this.isLoadingPop = false;
    });
  }
  updateACKinGEPO(model) {
    let updategateEntryM = {} as GateEntryM;
    updategateEntryM = model;
    updategateEntryM.ack = true;
    updategateEntryM.modifieD_BY = this.currentUser.employeeId;
    updategateEntryM.modifieD_DATE = this.getFormatedDateTime(new Date());
    let connection = this.httpService.put(APIURLS.BR_MASTER_GATEINWARDM_POST_API, updategateEntryM.id, updategateEntryM);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        this.isLoadingPop = false;
      }
    }).catch((error)=> {
      this.errMsgPop = 'Error update acknowledgement in GE Header';
      this.isLoadingPop = false;
    });
  }
  deleteGateEntry() {
    this.gateEntryMModel.deL_FLG = 'Y';
    this.gateEntryMModel.deL_REASON = this.reason;
    this.gateEntryMModel.deleteD_BY = this.currentUser.employeeId;
    this.gateEntryMModel.deleteD_DATE = this.getFormatedDateTime(new Date());
    this.gateEntryMModel.isActive = false;
    let connection = this.httpService.post(APIURLS.BR_RFCBAPI_DELETEGEPO_API, this.gateEntryMModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      jQuery('#myModal').modal('hide');
      if (data != null) {
        if (data.type == 'Y') {
          this.deactivateGateEntry();
          this.errMsgModalPop = 'Cancelled successfully!';
          swal(this.errMsgModalPop, {
            icon: "success",
          }).then((willsave) => {
            if (willsave) {
              this.getAllGateEntries('delete');
            }
          });
        }
        else {
          this.errMsgModalPop = 'Could not connect to SAP.Please try after sometime or contact to administrator';
          swal(this.errMsgModalPop, {
            icon: "warning",
          }).then((willsave) => {
            if (willsave) {
              this.getAllGateEntries('delete');
            }
          });
        }
      }
      else {
        this.errMsgModalPop = 'Could not connect to SAP.Please try after sometime or contact to administrator';
        swal(this.errMsgModalPop, {
          icon: "warning",
        }).then((willsave) => {
          if (willsave) {
            this.getAllGateEntries('delete');
          }
        });
      }
      this.isLoadingPop = false;
    }).catch((error)=> {
      this.errMsgPop = 'Could not connect to SAP.Please try after sometime or contact to administrator';
      this.isLoadingPop = false;
    });
  }

  deactivateGateEntry() {
    let connection = this.httpService.put(APIURLS.BR_MASTER_GATEINWARDM_POST_API, this.gateEntryMModel.id, this.gateEntryMModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        this.isLoadingPop = false;
      }
    }).catch((error)=> {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error Delete Returnable Materials...';
    });
  }
  departmentAcknowledge() {
    this.gateEntryMModel.receiveD_BY = this.currentUser.fullName;
    this.gateEntryMModel.receiveD_DATE = this.getFormatedDateTime(this.gateEntryMModel.receiveD_DATE);
    let connection = this.httpService.put(APIURLS.BR_MASTER_GATEINWARDM_POST_API, this.gateEntryMModel.id, this.gateEntryMModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        if (this.totalMaterialQTY == 0) {
          this.updateOutWardAcknowledge();
        }
        jQuery('#depModal').modal('hide');
        this.errMsgModalPop = 'Saved successfully!';
        swal(this.errMsgModalPop, {
          icon: "success",
        }).then((willsave) => {
          if (willsave) {
            this.getAllGateEntries('ack');
          }
        });
        this.isLoadingPop = false;
      }
    }).catch((error)=> {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error Acknowledge Return Materials...';
    });
  }
  updateOutWardAcknowledge() {
    this.gateOutwardMModel.gO_FLG = 'Y';
    let connection = this.httpService.put(APIURLS.BR_MASTER_GATEOUTWARDM_POST_API, this.gateOutwardMModel.id, this.gateOutwardMModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
      }
      this.isLoadingPop = false;
    }).catch((error)=> {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error Gate Entry...';
    });
  }
  remainingQTY(mat) {
    if (this.exReturnMaterialsList.length > 0) {
      return this.exReturnMaterialsList.find((x:any)  => x.iteM_NO == mat.iteM_NO) ? this.exReturnMaterialsList.find((x:any)  => x.iteM_NO == mat.iteM_NO).qtY_RCVD : 0;
    }
    return 0;
  }
  validateQTY(event, mat) {
    var recQTY: number = +event.target.value;
    var actQTY: number = +mat.qty;
    if (this.exReturnMaterialsList.length > 0) {
      var exQty = this.exReturnMaterialsList.find((x:any)  => x.iteM_NO == mat.iteM_NO) ? this.exReturnMaterialsList.find((x:any)  => x.iteM_NO == mat.iteM_NO).qtY_RCVD : 0;
      var totalQTY = exQty + recQTY;
      var remQTY = actQTY - exQty;
      if (actQTY < totalQTY) {
        swal({
          title: "Message",
          text: "Quantity received cannot be greater than remaining quantity",
          icon: "warning",
          dangerMode: false,
          buttons: [false, true]
        });
        event.target.value = 0;
        mat.qtY_RCVD = 0;
      }
    }
    else if (actQTY < recQTY) {
      swal({
        title: "Message",
        text: "Quantity received (" + recQTY + ") is more than actual quantity (" + actQTY + ") supplied",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      });
      event.target.value = 0;
      mat.qtY_RCVD = 0;
    }
    else if (recQTY<0) {
      swal({
        title: "Message",
        text: "Quantity received (" + recQTY + ") should be greater than Zero",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      });
    }
  }
  print(): void {
    let printContents, popupWin;
    printContents = document.getElementById('print-section').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>Gate Entry - Returnable Material</title>
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
