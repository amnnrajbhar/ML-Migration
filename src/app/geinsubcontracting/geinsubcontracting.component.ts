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
declare var $ :any;

@Component({
  selector: 'app-geinsubcontracting',
  templateUrl: './geinsubcontracting.html',
  styleUrls: ['./geinsubcontracting.component.css']
})
export class GEInSubContractingComponent implements OnInit {

  @ViewChild('userForm') userForm: any;

  searchTerm = new FormControl();
  currentUser: AuthData;
  tableWidget: any;
  path: string;
  fiscalYear: string;
  errMsg: string = "";
  errMsgPop: string = "";
  errMsgModalPop: string = "";
  isEdit: boolean;
  isLoading: boolean;
  isLoadingPop: boolean;
  isLoadingBAPI: boolean;
  gateEntryMModel = {} as GateEntryM;
  gateEntryDModel = {} as GateEntryD;
  gateEntryMList: GateEntryM[] = [];
  gateEntryDList: GateEntryD[] = [];
  gateOutwardMModel = {} as GateOutwardMaster;
  // gateOutwardDModel = {} as GateOutwardD;
  gateOutwardMList: GateOutwardMaster[] = [];
  // gateOutwardDList: GateOutwardD[] = [];
  pO_No: string;
  qtY_RCVD: any;
  entryDateTime: Date = new Date();
  userName: string;
  iN_TIME: any;
  reason: string;
  gONo: string;
  sendingPersonName:string;

  elementtype:string;

  max:Date=new Date();
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
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.userName = this.currentUser.fullName;
      this.getGateList();
    //  this.getPlantsassigned(this.currentUser.fkEmpId);
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
        this.selGateLocation = this.locationGateList.find(x => x.gateNo == '1');
      }
      this.isLoading = false;
    }).catch(() => {
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
        this.employeeList = data.map((i) => { i.empfull = i.firstName + ' ' + i.middleName + ' ' + i.lastName + '-' + i.employeeId + '-' + i.designation; return i; });
      }
    }).catch(error => {
      this.isLoading = false;
      this.employeeList = [];
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
  locationName: string;
  plant: string;
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
    }).catch(error => {
      this.isLoading = false;
      this.plant = '';
      this.locationName = '';
    });
  }
  baseloc={fkPlantId:0,code:'',name:''}
  getPlantsassigned(id)
  {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.plantList = data;  
        let temp=this.plantList.find(x=>x.fkPlantId == this.currentUser.baselocation);
        if(temp == null || temp == undefined)
        {
          this.location.forEach(element => {
            this.baseloc.fkPlantId=element.id;
            this.baseloc.code=element.code;
            this.baseloc.name=element.name;
          });
          this.plantList.push(this.baseloc);
        }    
       this.plant=this.plantList.find(x=>x.fkPlantId == this.currentUser.baselocation).code;   
      // this.getAllGateEntries("load");   
      }
      this.isLoading = false;
    }).catch(error => {
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
    this.from_date= new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    this.to_date = this.today;
    this.acknowledge = false;
    this.delete = false;
    this.fltrGINO = null;
    this.fltrInvoice = null;
    this.selectedModes = [];
  }
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  acknowledge: boolean = false;
  delete: boolean = false;
  fltrGINO: string;
  fltrInvoice: string;
  getAllGateEntries(msg) {
    this.isLoading = true;
    var genericGateEntryM = {} as GenericGateEntryM;
    genericGateEntryM.planT_ID = this.plant;
    genericGateEntryM.gI_TYPE = '3';
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
    this.httpService.post(APIURLS.BR_MASTER_GATEINWARDM_GETGEGATEPO_API, genericGateEntryM).then((data: any) => {
      if (data) {
        this.gateEntryMList = data;
        this.gateEntryMList.reverse();
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(() => {
      this.isLoading = false;
      this.gateEntryMList = [];
    });
    if (msg == 'print') {
      this.onGateEntryActions(true,this.gateEntryMModel,true);
    }
  }
  keyPressNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 32 && (charCode < 48 || charCode > 57)) {

      return false;
    }
    return true;
  }
  getGONumInfo(gONo) {
    this.resetForm();
    this.gONo=gONo;
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
      genericGateEntryM.gI_TYPE = '3';
      genericGateEntryM.gI_NO = this.gONo;
      genericGateEntryM.planT_ID = this.plant;
      genericGateEntryM.isActive = '1';    
      genericGateEntryM.fiN_YEAR=this.fiscalYear;
      this.httpService.post(APIURLS.BR_MASTER_GATEOUTWARDM_FILTER_API, genericGateEntryM).then((data: any) => {
        if (data) {
          let goData = data.filter((item: any) => {
            return item.gO_TYPE == "3" && item.ouT_TIME != null;// && item.gO_FLG!='Y';//4:STO
          });
          if (goData.length > 0) {           
            this.httpService.post(APIURLS.BR_GE_SUBCONTRACT_REPORT_API, genericGateEntryM).then((scdata: any) => {
              if (scdata) {
                if (scdata.length > 0) {
                  //this.gateOutwardMModel = goData[0];
                  Object.assign(this.gateOutwardMModel,goData[0]);
                  this.sendingPERSON = this.employeeList.find(x => x.employeeId == this.gateOutwardMModel.sendinG_PERSON);
                  this.sendingPersonName=this.sendingPERSON.firstName +' '+this.sendingPERSON.middleName +' '+ this.sendingPERSON.lastName;
                  this.gateEntryDList=scdata;
                  //this.getOutWardMaterial(this.gateOutwardMModel.id);
                }
                else {
                  swal({
                    title: "Message",
                    text: "Entered GO No already exists.Please enter different GO Number",
                    icon: "warning",
                    dangerMode: false,
                    buttons: [false, true]
                  });
                }
                //this.gateOutwardMList = scdata;
                // this.gateOutwardMList.reverse();
              }
              this.reInitDatatable();
              this.isLoading = false;
            }).catch(error => {
              this.isLoading = false;
              this.gateOutwardMList = [];
            });

           
          }
          else {
            swal({
              title: "Message",
              text: "Entered GO Number does not have an outward entry in GE",
              icon: "warning",
              dangerMode: false,
              buttons: [false, true]
            });
            // enterd GO no does not have an Outward entry in GE.
          }
        }
        this.isLoadingBAPI = false;
      }).catch(() => {
        this.isLoadingBAPI = false;
        this.gateOutwardMModel = {} as GateOutwardMaster;
      });
    }
  }
  getOutWardMaterial(fkHId) {
    this.isLoadingBAPI = true;
    this.httpService.getById(APIURLS.BR_MASTER_GATEOUTWARDD_ANY_API, fkHId).then((data: any) => {
      if (data) {
        this.gateEntryDList = data;
      }
      this.isLoadingBAPI = false;
    }).catch(() => {
      this.isLoadingBAPI = false;
      this.gateEntryDList = [];
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
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
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
              change: function (event, ui) {
                if (ui.item) {
                  $("#persoN_NAME").val(ui.item.name);
                  self.gateEntryMModel.persoN_NAME=ui.item.name;

                }
                else {
                  $("#persoN_NAME").val('');
                }
              },
              select: function (event, ui) {
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

  onGateEntryActions(isedit: boolean, gateEntryM: GateEntryM, isprint: boolean) {
    this.isEdit = isedit;
    this.resetForm();
    this.userForm.form.markAsPristine();
    this.userForm.form.markAsUntouched();
    this.userForm.form.updateValueAndValidity();
    if (isedit) {
      this.gateEntryMModel = Object.assign({},gateEntryM) ;
      var genericGateEntryM = {} as GenericGateEntryM;
      genericGateEntryM.gI_TYPE = '3';
      genericGateEntryM.gI_NO =gateEntryM.gO_NO;
      this.httpService.post(APIURLS.BR_MASTER_GATEOUTWARDM_FILTER_API, genericGateEntryM).then((data: any) => {
        if (data) {
          //this.gateOutwardMModel = data[0];
          Object.assign(this.gateOutwardMModel,data[0]);
          this.sendingPERSON = this.employeeList.find(x => x.employeeId == this.gateOutwardMModel.sendinG_PERSON);
          this.sendingPersonName=this.sendingPERSON.firstName +' '+this.sendingPERSON.middleName +' '+ this.sendingPERSON.lastName;
        }
      }).catch(() => {
        this.gateOutwardMModel = {} as GateOutwardMaster;
      });
      this.selGateLocation = this.locationGateList.find(x => x.gateNo == gateEntryM.gI_GATENO);
      this.fiscalYear = gateEntryM.fiN_YEAR;
      this.iN_TIME = gateEntryM.iN_TIME;
     // let enteredBY = this.employeeList.find(x => x.employeeId == gateEntryM.persoN_NAME);
      this.userName = gateEntryM.persoN_NAME;//enteredBY.firstName + ' ' + enteredBY.middleName + ' ' + enteredBY.lastName;
      this.httpService.getById(APIURLS.BR_MASTER_GATEINWARDD_ANY_API, gateEntryM.id).then((data: any) => {
        if (data.length > 0) {
          this.gateEntryDList = data;
        }
      }).catch(() => {
        this.gateEntryDList = [];
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
    this.iN_TIME = new Date();
    this.userName = this.currentUser.fullName;
    this.gateEntryMModel = {} as GateEntryM;
    this.gateEntryDModel = {} as GateEntryD;
    this.gateOutwardMModel = {} as GateOutwardMaster;
    this.lstgateEntryD = [];
    this.gateEntryDList = [];
    this.errMsgPop = '';
    this.errMsg = ''
    this.errMsgModalPop = '';
    this.reason = '';
    this.gONo = '';
   // this.selGateLocation = null;
    this.isLoadingBAPI = false;
    this.isLoadingPop = false;
  }
  onSaveEntry() {
    if (!this.isEdit) {
      //let zeroQTYMatList = this.gateEntryDList.filter(x => { return x.qtY_RCVD == 0 });
      let zeroQTYMatList = this.gateEntryDList.filter(x => { return x.qtY_Rcvd && x.qtY_Rcvd>0 });
      // if (zeroQTYMatList.length == this.gateEntryDList.length)
      if (zeroQTYMatList.length == 0) {
        swal({
          title: "Message",
          //text: "Please enter quatity.",
          text: "Please check and update atleast one Material received Quantity",
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
        buttons: [true,true],
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
    this.gateEntryMModel.gI_TYPE = '3'; //4:SC
    this.gateEntryMModel.gO_NO = this.gateOutwardMModel.gO_NO;
    this.gateEntryMModel.doC_NO = this.gateOutwardMModel.doC_NO;
    this.gateEntryMModel.doC_DATE = this.getDateFormate(this.gateOutwardMModel.doC_DATE);
    this.gateEntryMModel.gI_DATE = this.getDateFormate(dtinTime);
    var inTime = ("00" + dtinTime.getHours()).slice(-2) + ":" +
      ("00" + dtinTime.getMinutes()).slice(-2) + ":" +
      ("00" + dtinTime.getSeconds()).slice(-2);
    this.gateEntryMModel.iN_TIME = inTime;
    //this.gateEntryMModel.persoN_NAME = this.userName;
    this.gateEntryMModel.namE1=this.gateOutwardMModel.destinatioN_NM;
    this.gateEntryMModel.createD_BY = this.currentUser.employeeId;
    this.gateEntryMModel.createD_DATE = this.getFormatedDateTime(new Date());
    this.gateEntryMModel.courier_Date =this.gateEntryMModel.courier_Date?this.getDateFormate(this.gateEntryMModel.doC_DATE):null;
    this.gateEntryMModel.isActive = true;
    //Insert Material
    var index = 0;
    this.gateEntryDList.forEach(mtrl => {
      if (mtrl.qtY_Rcvd && mtrl.qtY_Rcvd > 0) {
        index = index + 1;
        this.gateEntryDModel = {} as GateEntryD;
        this.gateEntryDModel.mandt = '450'
        this.gateEntryDModel.fiN_YEAR = this.fiscalYear;
        this.gateEntryDModel.planT_ID = this.plant
        this.gateEntryDModel.gI_GATENO = this.selGateLocation.gateNo;
        this.gateEntryDModel.iteM_NO = mtrl.iteM_NO;
        this.gateEntryDModel.iteM_CODE = mtrl.iteM_CODE;
        this.gateEntryDModel.iteM_DESC = mtrl.iteM_DESC;
        this.gateEntryDModel.iteM_CODE_P = mtrl.iteM_CODE_P;
        this.gateEntryDModel.iteM_DESC_P = mtrl.iteM_DESC_P;
        this.gateEntryDModel.uom = mtrl.uom;
        this.gateEntryDModel.pO_NO = mtrl.pO_NO;
        this.gateEntryDModel.nO_OF_CASES = mtrl.nO_OF_CASES;
        this.gateEntryDModel.qty = mtrl.qty;
        this.gateEntryDModel.qtY_RCVD = mtrl.qtY_Rcvd;
        this.gateEntryDModel.createD_BY = this.currentUser.employeeId;
        this.gateEntryDModel.createD_DATE = this.getFormatedDateTime(new Date());
        this.gateEntryDModel.isActive = true;
        this.lstgateEntryD.push(this.gateEntryDModel);
      }
    });
    this.gateEntryMModel.gateEntryDViewModel = this.lstgateEntryD;
    let connection = this.httpService.post(APIURLS.BR_MASTER_GATEINWARDM_POST_API, this.gateEntryMModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        this.onUpdateOutwardSTO();
        this.sendGEPOtoCreateBAPI(data);
      }
    }).catch(() => {
      this.errMsgPop = 'Error saving Header...';
      this.isLoadingPop = false;
    });
  }
  onUpdateOutwardSTO() {
    if (this.gateEntryMModel.deL_FLG == 'Y')
      this.gateOutwardMModel.gO_FLG = 'N';
    else
      this.gateOutwardMModel.gO_FLG = 'Y';
    let connection = this.httpService.put(APIURLS.BR_MASTER_GATEOUTWARDM_POST_API, this.gateOutwardMModel.id, this.gateOutwardMModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error in Gate Outward Header';
    });
  }
  sendGEPOtoCreateBAPI(model) {
    this.gateEntryMModel = Object.assign({}, model);
    this.lstgateEntryD.forEach(x => {
      x.gI_NO = model.gI_NO;
     // x.pO_NO =this.gateOutwardMModel.dC_NO;
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
    }).catch(error => {
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
    }).catch(error => {
      this.errMsgPop = 'Error update acknowledgement in STO Header';
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
            icon: "error",
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
          icon: "error",
        }).then((willsave) => {
          if (willsave) {
            this.getAllGateEntries('delete');
          }
        });
      }
      this.isLoadingPop = false;
    }).catch(error => {
      this.errMsgPop = 'Could not connect to SAP.Please try after sometime or contact to administrator';
      //jQuery("#saveModal").modal('show');
      this.isLoadingPop = false;
    });
  }

  deactivateGateEntry() {
    let connection = this.httpService.put(APIURLS.BR_MASTER_GATEINWARDM_POST_API, this.gateEntryMModel.id, this.gateEntryMModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        this.onUpdateOutwardSTO();
        this.isLoadingPop = false;
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error Delete Gate entry STO...';
    });
  }
  
  validateQTY(event, mat) {
    var recQTY: number = +event.target.value;
    var actQTY: number = +mat.remainQTY;
    var tolerance: number = actQTY * 0.1;
     if (actQTY + tolerance < recQTY) {
      swal({
        title: "Message",
        text: "Quantity received (" + recQTY + ") should not be grater than 110% of To quantity (" + (actQTY + tolerance) + ") Remaining",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      });
      event.target.value = 0;
      mat.qtY_Rcvd=0;
    }
    else if (recQTY<0) {
      swal({
        title: "Message",
        text: "Quantity received (" + recQTY + ") should not be less than Zero",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      });
      event.target.value = 0;
      mat.qtY_Rcvd=0;
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
          <title>Gate Entry - Sub Contracting</title>
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
