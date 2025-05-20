import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { AuthData } from '../auth/auth.model';
import { GateInwardMaster } from '../gateentrymodels/gateinwardm.model';
import { Material } from '../masters/material/material.model';
import { APIURLS } from '../shared/api-url';
import { HttpService } from '../shared/http-service';
import { GateEntryM } from '../gateentry/gateentrym.model';
import { GateEntryD } from '../gateentry/gateentryd.model';
import { GenericGateEntryM } from '../gateentry/genericgateentrym.model';
import { SupplierMaster } from './suppliermaster.model';
import { RFCCreateGEPO } from '../gateentry/rfccreategepo.model';
import swal from 'sweetalert';
declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-gateentrywithoutpo',
  templateUrl: './gateentrywithoutpo.component.html',
  styleUrls: ['./gateentrywithoutpo.component.css']
})
export class GateentryWithoutPOComponent implements OnInit {
  @ViewChild('userForm') userForm: any;
  @ViewChild('depForm') depForm: any;
  @ViewChild('suppForm') suppForm: any;
  @ViewChild('matForm') matForm: any;

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
  pO_No: string;
  qtY_RCVD: any;
  entryDateTime: Date = new Date();
  userName: string;
  iN_TIME: any;
  reason: string;
  gateNo: string;
  gINo: string;
  max: Date = new Date();

  elementtype:string;

  landx:string='India';
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
     // this.getPlantsassigned(this.currentUser.fkEmpId);
      this.getLocationById(this.currentUser.baselocation);
      //this.getSupplierMasterList();
    }
    else
      this.router.navigate(["/unauthorized"]);
    // console.log(this.fiscalYear);
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
    }).catch(error => {
      this.isLoading = false;
      this.locationGateList = [];
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
      this.tableWidget.destroy()
      this.tableWidget = null
    }
    setTimeout(() => this.initDatatable(), 0)
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
       //this.getAllGateEntries("load");   
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
  fltrGINO: string;
  fltrInvoice: string;
  gIacknowledge: any = null;
  getAllGateEntries(msg) {
    this.isLoading = true;
    var genericGateEntryM = {} as GenericGateEntryM;
    genericGateEntryM.planT_ID = this.plant;
    genericGateEntryM.gI_TYPE = '1';
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
    }).catch(error => {
      this.isLoading = false;
      this.gateEntryMList = [];
    });
    if (msg == 'print') {
      this.onGateEntryActions(true, this.gateEntryMModel, 'print');
    }
  }
  supplierMasterList: SupplierMaster[] = [];
  getSupplierMasterList() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_SUPPLIER_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.supplierMasterList = data;//.map((i) => { i.vendorcode = i.code + '-' + i.name; return i; });
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.supplierMasterList = [];
    });
  }
  selectedSupplier = {} as SupplierMaster;
  onSupplierSelectionChanged(event) {
    if (event) {
      this.gateEntryMModel.lifnr = event.code;
      this.gateEntryMModel.namE1 = event.name;
      this.gateEntryMModel.orT01 = event.place;
      this.gateEntryMModel.regio = event.placeCode;
      this.gateEntryMModel.landx = event.country;

    }
    else {
      this.gateEntryMModel.namE1 = '';
      this.gateEntryMModel.regio = '';
      this.gateEntryMModel.lifnr = '';
      this.gateEntryMModel.landx = '';
      this.gateEntryMModel.orT01 = '';
    }
  }
  // adding Supplier Master
  supplierItem = {} as SupplierMaster;
  addSupplierMaster() {
    this.suppForm.form.markAsPristine();
    this.suppForm.form.markAsUntouched();
    this.suppForm.form.updateValueAndValidity();
    this.supplierItem = {} as SupplierMaster;
    jQuery("#supplierModal").modal('show');
  }
  saveSupplier(status: boolean) {
    let connection: any;
    this.supplierItem.isActive = true;
    if (!this.supplierMasterList.some(s => s.code.trim().toLowerCase() === this.supplierItem.code.trim().toLowerCase() && s.id != this.supplierItem.id)) {
      if (status) {
        this.supplierItem.createdBy = this.currentUser.uid;
        this.supplierItem.createdDate = new Date().toLocaleString();
        connection = this.httpService.post(APIURLS.BR_MASTER_SUPPLIER_MASTER_API, this.supplierItem);
      }
      else {
        this.supplierItem.modifiedBy = this.currentUser.uid;
        this.supplierItem.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_MASTER_SUPPLIER_MASTER_API, this.supplierItem.id, this.supplierItem);
      }
      connection.then((data: any) => {
        if (data == 200 || data.id > 0) {
          jQuery("#supplierModal").modal('hide');
          this.getSupplierMasterList();
        }
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving Supplier data..';
      });
    }
    else {
      this.isLoadingPop = false;
      this.errMsgPop = 'Supplier Entry already exists..';
    }
  }

  getGINumInfo(gINo) {
    this.resetForm();
    this.gINo = gINo ? gINo : '';
    if (this.gINo == '') {
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
      genericGateEntryM.gI_TYPE = '1';
      genericGateEntryM.gI_NO = this.gINo;
      genericGateEntryM.planT_ID = this.plant;
      genericGateEntryM.isActive = '1';
      this.httpService.post(APIURLS.BR_MASTER_GATEINWARDM_GETGEGATEPO_API, genericGateEntryM).then((data: any) => {
        if (data) {
          let giData = data.filter((item: any) => {
            return item.gI_TYPE == "1";
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
      }).catch(error => {
        this.isLoadingBAPI = false;
      });
    }
  }
  getGIMaterialDetails(fkID) {
    this.httpService.getById(APIURLS.BR_MASTER_GATEINWARDD_ANY_API, fkID).then((data: any) => {
      if (data) {
        data.forEach(mtrl => {
          let newDynamic = { id: 0, iteM_CODE: null, iteM_DESC: "", uom: null, qtY_RCVD: "", stored: "0" };
          newDynamic.iteM_CODE = mtrl.materiaL_TYPE;
          newDynamic.iteM_DESC = mtrl.iteM_DESC;
          newDynamic.uom = mtrl.uom;
          newDynamic.qtY_RCVD = mtrl.qtY_RCVD;
          this.dynamicArray.push(newDynamic);
        });
      }
    }).catch(error => {
      this.dynamicArray = [];
    });
  }
  getFormatedInTime(date: any) {
    let dt = new Date(date);
    let formateddate = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
      ("00" + dt.getDate()).slice(-2) + ' ' + "00" + ":" +"00" + ":" +"00" ;
    return formateddate;
  }
  dynamicArray: any = [];
  newDynamic: any = {};
  isAcknowledge: boolean;
  onGateEntryActions(isedit: boolean, gateEntryM: GateEntryM, action: string) {
    this.isEdit = isedit;
    this.resetForm();
    if (action == 'search' || action == 'acknowledge') {
      this.depForm.form.markAsPristine();
      this.depForm.form.markAsUntouched();
      this.depForm.form.updateValueAndValidity();
    }
    else {
      this.userForm.form.markAsPristine();
      this.userForm.form.markAsUntouched();
      this.userForm.form.updateValueAndValidity();
      this.getMaterialList();
      this.getUOMList();
    }
    if (isedit) {
      this.gateEntryMModel = Object.assign({}, gateEntryM);
      this.selGateLocation = this.locationGateList.find(x => x.gateNo == this.gateEntryMModel.gI_GATENO);
      this.fiscalYear = this.gateEntryMModel.fiN_YEAR;
      this.selectedSupplier = this.supplierMasterList.find(x => x.code == this.gateEntryMModel.lifnr);
      this.userName = this.gateEntryMModel.persoN_NAME;
      this.iN_TIME = this.gateEntryMModel.iN_TIME;
      this.isAcknowledge = gateEntryM.receiveD_DATE != null ? true : false;

      this.intime=this.getFormatedInTime(this.gateEntryMModel.iN_TIME);

      this.httpService.getById(APIURLS.BR_MASTER_GATEINWARDD_ANY_API, gateEntryM.id).then((data: any) => {
        if (data) {
          data.forEach(mtrl => {
            let newDynamic = { id: 0, iteM_CODE: null, iteM_DESC: "", uom: null, qtY_RCVD: "", stored: "0" };
            newDynamic.id = mtrl.id;
            newDynamic.iteM_CODE = mtrl.materiaL_TYPE;
            newDynamic.iteM_DESC = mtrl.iteM_DESC;
            newDynamic.uom = mtrl.uom;
            newDynamic.qtY_RCVD = mtrl.qtY_RCVD;
            this.dynamicArray.push(newDynamic);
          });
        }
      }).catch(error => {
        this.dynamicArray = [];
      });
    }
    else if (action == 'new') {
      this.newDynamic = { id: this.rowcount, iteM_CODE: null, iteM_DESC: "", uom: null, qtY_RCVD: "", stored: "0" };
      this.dynamicArray.push(this.newDynamic);
    }
    if (action == 'print') {
      jQuery("#printModal").modal('show');
    }
    else if (action == 'search' || action == 'acknowledge') {
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
    this.gateEntryDList = [];
    this.selectedSupplier = null;
    this.errMsgPop = '';
    this.errMsg = ''
    this.errMsgModalPop = '';
    this.reason = '';
    this.dynamicArray = [];
    this.gINo = '';
    this.isLoadingPop = false;
    this.isLoadingBAPI = false;
    this.rowcount = 0;
  }
  UOMList: any;
  getUOMList() {
    this.httpService.get(APIURLS.BR_MASTER_UOM_MASTER_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        if (this.isEdit)
          this.UOMList = data;
        else
          this.UOMList = data.filter(x => x.isActive);
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.UOMList = [];
    });
  }
  materialList: any;
  getMaterialList() {
    this.httpService.get(APIURLS.BR_MASTER_MATERIALTYPE_GETUNIQUETYPE_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        if (this.isEdit)
          this.materialList = data;
        else
          this.materialList = data.filter(x => x.isActive);
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.materialList = [];
    });
  }
  // adding material master
  materialItem = {} as Material;
  addMaterialMaster() {
    this.matForm.form.markAsPristine();
    this.matForm.form.markAsUntouched();
    this.matForm.form.updateValueAndValidity();
    this.materialItem = {} as Material;
    jQuery("#materialModal").modal('show');
  }
  saveMaterial(materials: any) {
    materials.forEach(mtrl => {
      let matId = this.materialList.find(s => s.type == mtrl.iteM_CODE).id;
      let materialItem = new Material();
      materialItem.fkMaterialType = matId;
      materialItem.description = mtrl.iteM_DESC;
      materialItem.createdBy = this.currentUser.uid;
      materialItem.createdDate = this.getFormatedDateTime(new Date());
      let connection = this.httpService.post(APIURLS.BR_MASTER_MATERIAL_POST_PUT_API, materialItem);
      connection.then((data: any) => {
        if (data == 200 || data.id > 0) {
        }
      }).catch(error => {

      });
    });
  }
  rowcount: number = 0;
  addRows(index) {
    this.rowcount = this.rowcount + 1;
    this.newDynamic = { id: this.rowcount, iteM_CODE: null, iteM_DESC: "", uom: null, qtY_RCVD: "", stored: "0" };
    this.dynamicArray.push(this.newDynamic);
  }
  removeRows(item) {
    if (this.dynamicArray.length > 1) {
      const index = this.dynamicArray.indexOf(item);
      this.dynamicArray.splice(index, 1);
    }
  }
  setDesc(mtrl) {
    let matId = this.materialList.find(s => s.type == mtrl.iteM_CODE).id;
    var self = this;
    $('#iteM_DESC' + mtrl.id).autocomplete({
      source: function (request, response) {
        var searchTerm = 'description'+';'+request.term + ';' + matId;
        let connection = self.httpService.getByParam(APIURLS.BR_MASTER_MATERIAL_GETBYPARAM_API, searchTerm);
        connection.then((data: any) => {
          if (data) {
            const uniqueset = new Set(data.map(x => x.description))
            let result = Array.from(uniqueset);
            response(result.map(item => ({ 'label': item, 'val': item })));
          }
        }).catch(error => {
        });
      },
      select: function (event, ui) {
        mtrl.iteM_DESC = ui.item.label;
        mtrl.stored = "1";
        return false;
      }
    });
    $('#iteM_DESC' + mtrl.id).keydown(function () {
      mtrl.stored = "0";
    });
  }

  onSaveEntry() {
    if (!this.isEdit) {
      let usermatlist = this.dynamicArray.filter(x => { return x.stored == "0" });
      let zeroQTYMatList = this.dynamicArray.filter(x => { return x.qtY_RCVD <= 0 });
      if (zeroQTYMatList.length > 0) {
        swal({
          title: "Message",
          text: "One or more material quantity is zero. Please check and update.",
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
        })
          .then((willsave) => {
            if (willsave) {
              this.insertGateEntry();
              this.saveMaterial(usermatlist);
            }
          });
      }
    }
    else {
      swal({
        title: "Are you sure to Cancel Entry?",
        icon: "warning",
        buttons: [true, true],
      })
        .then((willsave) => {
          if (willsave) {
            this.deleteGateEntry();
          }
        });
    }
  }

  validateQTY(event, mat) {
    var recQTY: number = +event.target.value;
    var actQTY: number = +mat.disP_QUAN;
   
       if (recQTY<0) {
        swal({
          title: "Message",
          text: "Quantity received (" + recQTY + ") should be greater than Zero",
          icon: "warning",
          dangerMode: false,
          buttons: [false, true]
        });
        event.target.value = '';
    }
  }
  intime:string;

  insertGateEntry() {
    this.isLoadingPop = true;
    var dtinTime = new Date(this.iN_TIME);
    this.gateEntryMModel.mandt = '450'
    this.gateEntryMModel.fiN_YEAR = this.fiscalYear;
    this.gateEntryMModel.planT_ID = this.plant
    this.gateEntryMModel.gI_GATENO = this.selGateLocation.gateNo;
    this.gateEntryMModel.gI_TYPE = '1'
    this.gateEntryMModel.doC_DATE = this.getDateFormate(this.gateEntryMModel.doC_DATE);
    this.gateEntryMModel.gI_DATE = this.getDateFormate(dtinTime);
    var inTime = ("00" + dtinTime.getHours()).slice(-2) + ":" +
      ("00" + dtinTime.getMinutes()).slice(-2) + ":" +
      ("00" + dtinTime.getSeconds()).slice(-2);
    this.gateEntryMModel.iN_TIME = inTime;
    this.gateEntryMModel.landx=this.landx;
   // this.gateEntryMModel.persoN_NAME = this.userName;
    this.gateEntryMModel.createD_BY = this.currentUser.employeeId;
    this.gateEntryMModel.createD_DATE = this.getFormatedDateTime(new Date());
    this.gateEntryMModel.courier_Date =this.gateEntryMModel.courier_Date?this.getDateFormate(this.gateEntryMModel.doC_DATE):null;
    this.gateEntryMModel.isActive = true;
    //Insert Material
    var index = 0;
    this.dynamicArray.forEach(mtrl => {
      if (+mtrl.qtY_RCVD > 0) {
        index = index + 1;
        this.gateEntryDModel = {} as GateEntryD;
        this.gateEntryDModel.mandt = '450'
        this.gateEntryDModel.fiN_YEAR = this.fiscalYear;
        this.gateEntryDModel.planT_ID = this.plant
        this.gateEntryDModel.gI_GATENO = this.selGateLocation.gateNo;
        this.gateEntryDModel.iteM_NO = index;
        this.gateEntryDModel.materiaL_TYPE = mtrl.iteM_CODE
        this.gateEntryDModel.iteM_DESC = mtrl.iteM_DESC;
        this.gateEntryDModel.uom = mtrl.uom;
        this.gateEntryDModel.nO_OF_CASES = 0;
        this.gateEntryDModel.qtY_RCVD = mtrl.qtY_RCVD;
        this.gateEntryDModel.createD_BY = this.currentUser.employeeId;
        this.gateEntryDModel.createD_DATE = this.getFormatedDateTime(new Date());
        this.gateEntryDModel.isActive = true;
        this.gateEntryDList.push(this.gateEntryDModel);
      }
    });
    this.gateEntryMModel.gateEntryDViewModel = this.gateEntryDList;

    let connection = this.httpService.post(APIURLS.BR_MASTER_GATEINWARDM_POST_API, this.gateEntryMModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        this.sendGEPOtoCreateBAPI(data);
      }
    }).catch(error => {
      this.errMsgPop = 'Error saving Header...';
      this.isLoadingPop = false;
    });
  }
  sendGEPOtoCreateBAPI(model) {
    this.gateEntryMModel = Object.assign({}, model);
    this.gateEntryDList.forEach(x => {
      x.gI_NO = model.gI_NO;
    });
    let rfcCreateGEPO = {} as RFCCreateGEPO;
    rfcCreateGEPO.gateEntryInputs = this.gateEntryMModel;
    rfcCreateGEPO.gateEntryMaterial = this.gateEntryDList;
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
      // jQuery("#saveModal").modal('show');
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
          this.errMsgModalPop ='Cancelled successfully!';
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
      //jQuery("#saveModal").modal('show');
      this.isLoadingPop = false;
    }).catch(error => {
      this.errMsgPop = 'Could not connect to SAP.Please try after sometime or contact to administrator';
      // jQuery("#saveModal").modal('show');
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
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error Delete Without PO...';
    });
  }
  departmentAcknowledge() {
    this.gateEntryMModel.receiveD_BY = this.currentUser.fullName;
    this.gateEntryMModel.receiveD_DATE = this.getFormatedDateTime(this.gateEntryMModel.receiveD_DATE);
    let connection = this.httpService.put(APIURLS.BR_MASTER_GATEINWARDM_POST_API, this.gateEntryMModel.id, this.gateEntryMModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        jQuery('#depModal').modal('hide');
        this.errMsgModalPop = 'Saved successfully!';
        swal(this.errMsgModalPop, {
          icon: "success",
        }).then((willsave) => {
          if (willsave) {
            this.getAllGateEntries('acknowledge');
          }
        });
        //jQuery("#saveModal").modal('show');
        this.isLoadingPop = false;
        //this.sendGEPOtoCreateBAPI(data);
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error Acknowledge Without PO...';
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
          <title>Gate Entry - With Out PO</title>
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
