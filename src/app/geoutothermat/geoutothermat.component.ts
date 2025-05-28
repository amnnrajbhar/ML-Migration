import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import swal from 'sweetalert';
import { AppComponent } from '../app.component';
import { AuthData } from '../auth/auth.model';
import { GateOutwardD } from '../gateentrymodels/gateoutwardd.model';
import { GateOutwardMaster } from '../gateentrymodels/gateoutwardm.model';
import { APIURLS } from '../shared/api-url';
import { HttpService } from '../shared/http-service';
import { Material } from '../masters/material/material.model';
import { GenericGateEntryM } from '../gateentry/genericgateentrym.model';
declare var jQuery: any;
declare var $: any;

// import * as pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
// import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient, HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-geoutothermat',
  templateUrl: './geoutothermat.component.html',
  styleUrls: ['./geoutothermat.component.css']
})
export class GEOutOtherMaterialComponent implements OnInit {
 @ViewChild('userForm', { static: false }) userForm: any;

@ViewChild('matForm', { static: false }) matForm: any;
@ViewChild('userSAPForm', { static: false }) userSAPForm: any;


  searchTerm = new FormControl();
  currentUser!: AuthData;
  tableWidget: any;
  path!: string
  fiscalYear: string
  errMsg: string = "";
  errMsgPop: string = "";
  errMsgModalPop: string = "";
  errMsgMatPop: string = "";
  isEdit!: boolean;
  isLoading!: boolean;
  isLoadingPop!: boolean;
  isLoadingBAPI!: boolean;
  isLoadingMatPop!: boolean;
  gateOutwardMModel = {} as GateOutwardMaster;
  gateOutwardDModel = {} as GateOutwardD;
  gateOutwardMList: GateOutwardMaster[] = [];
  gateOutwardDList: GateOutwardD[] = [];
  pO_No: string
  qtY_RCVD: any;
  entryDateTime: Date = new Date();
  reason: string
  invNO: string
  sendingPersonName: string
  mindate: Date = new Date();

  elementtype: string

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private https: HttpClient) {
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
 }
  getCurrentFinancialYear() {
    var fiscalyear = "";
    var today = new Date();

    this.elementtype = "svg";

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
    this.fiscalYear = this.getCurrentFinancialYear();
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.getLocationById(this.currentUser.baselocation);
      this.getPlantsassigned(this.currentUser.fkEmpId);
      //this.getGateList();
      this.getLocationList();
      this.getDepartmentList();
      this.getEmployeeList();
      this.getbase64image();

      //this.suggestions();
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
  plantList: any[] = [];
  location: any[] = [];
  baseloc = { fkPlantId: 0, code: '', name: '' }
  getPlantsassigned(id:any) {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.plantList = data;
        let temp = this.plantList.find((x:any)  => x.fkPlantId == this.currentUser.baselocation);
        if (temp == null || temp == undefined) {
          this.location.forEach((element:any)=> {

            this.baseloc.fkPlantId = element.id;
            this.baseloc.code = element.code;
            this.baseloc.name = element.name;
          });
          this.plantList.push(this.baseloc);
        }
        this.plant = this.plantList.find((x:any)  => x.fkPlantId == this.currentUser.baselocation).code;
        this.loadGateOutwardList('load');
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.plantList = [];
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
        // this.selGateLocation = null;
        // this.selGateLocation = this.locationGateList.find((x:any)  => x.gateNo == 'G1');
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
        // this.selDestination = null;
        let code = this.locationList.find((x:any)  => x.id == this.currentUser.baselocation).code;
        this.getApproversDetails(code);
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.locationList = [];
    });
  }
  Approverslist: any[] = [];
  getApproversDetails(code:any) {
    this.httpService.getByParam(APIURLS.BR_GET_VMS_APPROVERS, code + ',Gate' + "," + this.currentUser.employeeId).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.Approverslist = data;
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.Approverslist = [];
    });
  }
  employeeList = [];
  employeeAllList = [];
  sendingPERSON: any;
  getEmployeeList() {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_EMPLOYEEMASTER_GETBY_ANY_API, this.currentUser.baselocation).then((data: any) => {
      if (data.length > 0) {
        this.employeeAllList = data.map((i:any) => { i.empfull = i.firstName + ' ' + i.middleName + ' ' + i.lastName + '-' + i.employeeId + '-' + i.designation; return i; });
        this.employeeList = this.employeeAllList.filter((x:any)  => x.isActive);
        this.sendingPERSON = this.employeeList.find((x:any)  => x.employeeId == this.currentUser.employeeId);
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
        this.sendingDEPTNAME = this.departmentList.find((x:any)  => x.id == this.currentUser.fK_Department);
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
    { id: 0, name: 'In Person' },
    { id: 1, name: 'Courier' },
    { id: 2, name: 'Vehicle' }
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
    this.delete = false;
    this.fltrGONO = null;
    this.fltrInvoiceNo = null;
    this.fltrDCNO = null;
    this.selectedModes = [];
  }
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  delete: boolean = false;
  fltrGONO: string
  fltrInvoiceNo: string
  fltrDCNO: string
  // 2:Returnable, N:Non-Returnable
  loadGateOutwardList(action) {
    this.isLoading = true;
    var genericGateEntryM = {} as GenericGateEntryM;
    genericGateEntryM.planT_ID = this.plant;
    genericGateEntryM.gI_TYPE = '2,N';//2:Returnable|N:Non-Returnable
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
    //console.log(genericGateEntryM);
    this.httpService.post(APIURLS.BR_MASTER_GATEOUTWARDM_FILTER_API, genericGateEntryM).then((data: any) => {
      if (data) {
        //console.log(data);
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
      this.onGateEntryActions(true, this.gateOutwardMModel, true, 'print');
    }
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
  typeChange(val:any) {
    if (val != "2") {
      this.gateOutwardMModel.exP_RETURN_DATE = null;
    }
  }
  getGoNO(gONO: string): string {
    return gONO != null ? gONO.toString().padStart(4, '0').toString() : '';
  }

  getInvoiceInfoFromBAPI(invNO) {

  }
  dynamicArray: any = [];
  newDynamic: any = {};
  isDelete: boolean = true;
  onGateEntryActions(isedit: boolean, gateOutwardM: GateOutwardMaster, isprint: boolean, type: string) {
    this.isEdit = isedit;
    this.resetForm();
    if (type == 'manual') {
      this.userForm.form.markAsPristine();
      this.userForm.form.markAsUntouched();
      this.userForm.form.updateValueAndValidity();
      this.getUOMList();
      this.getMaterialList();
    }
    // else {
    //   this.userSAPForm.form.markAsPristine();
    //   this.userSAPForm.form.markAsUntouched();
    //   this.userSAPForm.form.updateValueAndValidity();
    // }
    if (isedit) {
      this.employeeList = this.employeeAllList;
      this.gateOutwardMModel = Object.assign({}, gateOutwardM);
      // let postedlocation = this.locationList.find((x:any)  => x.code == this.gateOutwardMModel.planT_ID);
      // this.locationName = postedlocation ? postedlocation.code + '-' + postedlocation.name : '';
      this.sendingPERSON = this.employeeList.find((x:any)  => x.employeeId == this.gateOutwardMModel.sendinG_PERSON);
      this.sendingPersonName = this.gateOutwardMModel.sendingPersonName;
      // this.sendingPersonName = this.sendingPERSON.firstName + ' ' + this.sendingPERSON.middleName + ' ' + this.sendingPERSON.lastName;
      this.sendingDEPTNAME = this.departmentList.find((x:any)  => x.name == this.gateOutwardMModel.sendinG_DEPT_NM);
      this.fiscalYear = this.gateOutwardMModel.fiN_YEAR;
      if (this.gateOutwardMModel.gO_TYPE == '2' && this.gateOutwardMModel.ouT_TIME != null) {
        this.isDelete = false;
      }
        var loc = this.plantList.find(x=>x.code == this.gateOutwardMModel.planT_ID)
        this.locationName=loc.code +'-'+loc.name;
        this.httpService.getById(APIURLS.BR_MASTER_GATEOUTWARDD_ANY_API, gateOutwardM.id).then((data: any) => {
          if (data) {
            data.forEach((mtrl:any) => {
              let newDynamic = {
                id: 0, iteM_CODE: null, material_Type: null, iteM_DESC: null, uom: null, nO_OF_CASES: null,
                qty: null, exP_RETURN_DATE: null, remarks: null, stored: "0"
              };
            newDynamic.id = mtrl.id;
            newDynamic.material_Type = mtrl.materiaL_TYPE;
            newDynamic.iteM_CODE = mtrl.iteM_CODE;
            newDynamic.iteM_DESC = mtrl.iteM_DESC;
            newDynamic.uom = mtrl.uom;
            newDynamic.nO_OF_CASES = mtrl.nO_OF_CASES;
            newDynamic.qty = mtrl.qty;
            newDynamic.exP_RETURN_DATE = mtrl.exP_RETURN_DATE;
            newDynamic.remarks = mtrl.remarks;
            this.dynamicArray.push(newDynamic);
          });
        }
      }).catch((error)=> {
        this.dynamicArray = [];
      });
    }
    else {
      if (type == 'manual') {
        this.newDynamic = { id: this.rowcount, iteM_CODE: null, material_Type: null, iteM_DESC: null, uom: null, nO_OF_CASES: null, qty: null, stored: "0" };
        this.dynamicArray.push(this.newDynamic);
      }
    }
    if (isprint) {
      //jQuery("#printModal").modal('show');
      this.getplantAddress(gateOutwardM.planT_ID);
      this.printDC();
    }
    else {
      if (type == 'manual')
        jQuery("#myModal").modal('show');
      // else
      //   jQuery("#sapModal").modal('show');
    }
  }

  resetForm(): void {
    this.entryDateTime = new Date();
    this.gateOutwardMModel = {} as GateOutwardMaster;
    this.gateOutwardDModel = {} as GateOutwardD;
    this.gateOutwardDList = [];
    // this.selGateLocation = null;
    this.errMsgPop = '';
    this.errMsg = ''
    this.errMsgModalPop = '';
    this.reason = '';
    // this.selDestination = null;
    this.employeeList = this.employeeAllList.filter((x:any)  => x.isActive);
    this.sendingPERSON = this.employeeList.find((x:any)  => x.employeeId == this.currentUser.employeeId);
    this.sendingDEPTNAME = this.departmentList.find((x:any)  => x.id == this.currentUser.fK_Department);
    this.dynamicArray = [];
    this.rowcount = 0;
    this.isDelete = true;
  }
  changeDepartment(employee) {
    if (employee != null) {
      this.sendingDEPTNAME = this.departmentList.find((x:any)  => x.id == employee.fkDepartment);
    }
    else
      this.sendingDEPTNAME = null;
  }
  UOMList: any;
  getUOMList() {
    this.httpService.get(APIURLS.BR_MASTER_UOM_MASTER_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        if (this.isEdit)
          this.UOMList = data;
        else
          this.UOMList = data.filter((x:any)  => x.isActive);
      }
      this.isLoading = false;
    }).catch((error)=> {
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
          this.materialList = data.filter((x:any)  => x.isActive);
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.materialList = [];
    });
  }
  // adding material master
  materialItem = {} as Material;
  addMaterialMaster() {
    this.isLoadingMatPop = false;
    this.errMsgMatPop = '';
    this.matForm.form.markAsPristine();
    this.matForm.form.markAsUntouched();
    this.matForm.form.updateValueAndValidity();
    this.materialItem = {} as Material;
    jQuery("#materialModal").modal('show');
  }
  saveMaterial(materials: any) {
    materials.forEach((mtrl:any) => {
      let matId = this.materialList.find((s:any) => s.type == mtrl.material_Type).id;
      let materialItem = new Material();
      materialItem.fkMaterialType = matId;
      materialItem.materialCode = mtrl.iteM_CODE;
      materialItem.description = mtrl.iteM_DESC;
      materialItem.createdBy = this.currentUser.uid;
      materialItem.createdDate = this.getFormatedDateTime(new Date());
      let connection = this.httpService.post(APIURLS.BR_MASTER_MATERIAL_POST_PUT_API, materialItem);
      connection.then((data: any) => {
        if (data == 200 || data.id > 0) {
        }
      }).catch((error)=> {

      });
    });
  }
  rowcount: number = 0;
  addRows(index) {
    this.rowcount = this.rowcount + 1;
    this.newDynamic = { id: this.rowcount, iteM_CODE: null, material_Type: null, iteM_DESC: null, uom: null, nO_OF_CASES: null, qty: null, stored: "0" };
    this.dynamicArray.push(this.newDynamic);
    let shift: string

  }
  removeRows(item:any) {
    if (this.dynamicArray.length > 1) {
      const index = this.dynamicArray.indexOf(item);
      this.dynamicArray.splice(index, 1);
    }
  }
  setDesc(mtrl) {
    let matId = this.materialList.find((s:any) => s.type == mtrl.material_Type).id;
    var self = this;
    $('#iteM_DESC' + mtrl.id).autocomplete({
      source: function (request:any, response:any) {
        var searchTerm1 = 'description' + ';' + request.term + ';' + matId;
        let connection = self.httpService.getByParam(APIURLS.BR_MASTER_MATERIAL_GETBYPARAM_API, searchTerm1);
        connection.then((data: any) => {
          if (data) {
            let result = data.filter((x:any)  => { return x.materialCode != null });
            response(result.map((i:any) => { i.label = i.description, i.val = i.materialCode; return i; }));
          }
        }).catch((error)=> {
        });
      },
      select: function (event:any, ui:any) {
        mtrl.iteM_DESC = ui.item.label;
        mtrl.iteM_CODE = ui.item.val;
        mtrl.stored = "1";
        return false;
      }
    });
    $('#iteM_DESC' + mtrl.id).keydown(function () {
      mtrl.stored = "0";
    });
    $('#iteM_CODE' + mtrl.id).autocomplete({
      source: function (request:any, response:any) {
        var searchTerm2 = 'returnable' + ';' + request.term + ';' + matId;
        let connection = self.httpService.getByParam(APIURLS.BR_MASTER_MATERIAL_GETBYPARAM_API, searchTerm2);
        connection.then((data: any) => {
          if (data) {
            response(data.map((i:any) => { i.label = i.materialCode, i.val = i.description; return i; }));
          }
        }).catch((error)=> {
        });
      },
      select: function (event:any, ui:any) {
        mtrl.iteM_CODE = ui.item.label;
        mtrl.iteM_DESC = ui.item.val;
        mtrl.stored = "1";
        return false;
      }
    });
    $('#iteM_CODE' + mtrl.id).keydown(function () {
      mtrl.stored = "0";
    });
  }

  keyPressNumber(evt:any) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 32 && (charCode < 48 || charCode > 57)) {

      return false;
    }
    return true;
  }
  onSaveEntry() {
    if (!this.isEdit) {
      let usermatlist = this.dynamicArray.filter((x:any)  => { return x.stored == "0" });
      let zeroQTYMatList = this.dynamicArray.filter((x:any)  => { return x.qty == 0 });
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
          dangerMode: false,
        })
          .then((willsave) => {
            if (willsave) {
              this.insertGateOutstock();
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
        dangerMode: false,
      })
        .then((willsave) => {
          if (willsave) {
            this.deactivateGateEntry();
          }
        });
    }
  }
  insertGateOutstock() {
    this.isLoadingPop = true;
    this.gateOutwardMModel.mandt = '450'
    this.gateOutwardMModel.fiN_YEAR = this.fiscalYear;
    this.gateOutwardMModel.planT_ID = this.plant;
    this.gateOutwardMModel.gO_GATENO = '1';
    //this.gateOutwardMModel.gO_TYPE = '4';

   
    this.gateOutwardMModel.gO_DATE = this.getDateFormate(new Date());
    this.gateOutwardMModel.exP_OUT_TIME = this.getFormatedDateTime(this.gateOutwardMModel.exP_OUT_TIME);
    this.gateOutwardMModel.sendinG_PERSON = this.sendingPERSON.employeeId;
    this.gateOutwardMModel.sendinG_DEPT_NM = this.sendingDEPTNAME.name;
    this.gateOutwardMModel.createD_BY = this.currentUser.employeeId;
    this.gateOutwardMModel.createD_DATE = this.getFormatedDateTime(new Date());
    this.gateOutwardMModel.courier_Date = this.gateOutwardMModel.courier_Date?this.getDateFormate(this.gateOutwardMModel.doC_DATE):null;
    this.gateOutwardMModel.isActive = true;
    this.gateOutwardMModel.doC_DATE = this.getDateFormate(this.gateOutwardMModel.doC_DATE);
    
    if (this.gateOutwardMModel.gO_TYPE == '2') {
      const datesArray = this.dynamicArray.map((element) => new Date(element.exP_RETURN_DATE));
      this.gateOutwardMModel.exP_RETURN_DATE = this.getFormatedDateTime(new Date(Math.max(...datesArray)));
    }

    this.gateOutwardMModel.status = 'Pending For Approval';
    this.gateOutwardMModel.pendingWith = this.Approverslist[0].approverId;
    //Insert Material
    var index = 0;
    let lstgateOutwardD: GateOutwardD[] = [];
    this.dynamicArray.forEach((mtrl:any) => {
      if (+mtrl.qty > 0) {
        index = index + 1;
        this.gateOutwardDModel = {} as GateOutwardD;
        this.gateOutwardDModel.mandt = '450'
        this.gateOutwardDModel.fiN_YEAR = this.fiscalYear;
        this.gateOutwardDModel.planT_ID = this.plant
        this.gateOutwardDModel.gO_GATENO = '1';
        this.gateOutwardDModel.iteM_NO = index;
        this.gateOutwardDModel.materiaL_TYPE = mtrl.material_Type;
        this.gateOutwardDModel.iteM_CODE = mtrl.iteM_CODE;
        this.gateOutwardDModel.iteM_DESC = mtrl.iteM_DESC;
        this.gateOutwardDModel.uom = mtrl.uom;
        // this.gateOutwardDModel.nO_OF_CASES = 0;
        this.gateOutwardDModel.qty = mtrl.qty;
        this.gateOutwardDModel.createD_BY = this.currentUser.employeeId;
        this.gateOutwardDModel.createD_DATE = this.getFormatedDateTime(new Date());
        if (this.gateOutwardMModel.gO_TYPE == '2') {
          this.gateOutwardDModel.exP_RETURN_DATE = this.getFormatedDateTime(mtrl.exP_RETURN_DATE);
        }
        this.gateOutwardDModel.remarks = mtrl.remarks;
        this.gateOutwardDModel.isActive = true;
        lstgateOutwardD.push(this.gateOutwardDModel);
      }
    });
    this.gateOutwardMModel.gateOutwardDViewModel = lstgateOutwardD;
    let connection = this.httpService.post(APIURLS.BR_MASTER_GATEOUTWARDM_POST_API, this.gateOutwardMModel);
    connection.then((data: any) => {
      if (data == 200 || data.id > 0) {
        this.gateOutwardMModel = Object.assign({}, data);
        jQuery('#myModal').modal('hide');
        //jQuery("#sapModal").modal('hide');
        this.errMsgModalPop = 'Saved successfully!';
        swal(this.errMsgModalPop, {
          icon: "success",
        }).then((willsave) => {
          if (willsave) {
            this.loadGateOutwardList('print');
          }
        });
      }
      this.isLoadingPop = false;
    }).catch((error)=> {
      this.errMsgPop = 'Error saving Outward...';
      this.isLoadingPop = false;
    });
  }
  deactivateGateEntry() {
    this.isLoadingPop = true;
    this.gateOutwardMModel.deL_FLG = 'Y';
    this.gateOutwardMModel.deL_REASON = this.reason;
    this.gateOutwardMModel.deleteD_BY = this.currentUser.employeeId;
    this.gateOutwardMModel.deleteD_DATE = this.getDateFormate(new Date());
    this.gateOutwardMModel.isActive = false;
    let connection = this.httpService.put(APIURLS.BR_MASTER_GATEOUTWARDM_POST_API, this.gateOutwardMModel.id, this.gateOutwardMModel);
    connection.then((data: any) => {
      if (data == 200 || data.id > 0) {
        jQuery('#myModal').modal('hide');
        this.errMsgModalPop = 'Cancelled successfully!';
        swal(this.errMsgModalPop, {
          icon: "success",
        }).then((willsave) => {
          if (willsave) {
            this.loadGateOutwardList('delete');
          }
        });
      }
      this.isLoadingPop = false;
    }).catch((error)=> {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error Delete Gate Entry Outward...';
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
          <title>Outward - Other Material</title>
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

  validateQTY(event, mat) {
    var recQTY: number = +event.target.value;
    var actQTY: number = +mat.disP_QUAN;

    if (recQTY < 0) {
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
  setFormatedDateTime(date: any) {
    let dt = new Date(date);
    let formateddate = ("00" + dt.getDate()).slice(-2) + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
      dt.getFullYear() + ' ' +
      ("00" + dt.getHours()).slice(-2) + ":" +
      ("00" + dt.getMinutes()).slice(-2) + ":" +
      ("00" + dt.getSeconds()).slice(-2);
    return formateddate;
  }
  userimage!: string
  getbase64image() {
    this.https.get('../../assets/dist/img/micrologo.png', { responseType: 'blob' })
      .subscribe(blob => {
        const reader = new FileReader();
        const binaryString = reader.readAsDataURL(blob);
        reader.onload = (event: any) => {
          console.log('Image in Base64: ', event.target.result);
          this.userimage = event.target.result;
        };

      });
  }

  plantAddressDetails: any[] = [];
  address: any = {};
  getplantAddress(code) {
    this.isLoading = true;
    this.httpService.getByParam(APIURLS.GET_PLANT_ADDRESS_DETAILS, code).then((data:any) => {
      if (data) {
        this.plantAddressDetails = data;
        this.address = Object.assign({}, this.plantAddressDetails[0])
      }
      this.isLoading = false;
    }).catch((error) => {
      this.plantAddressDetails = [];
      this.isLoading = false;
    })
  }

  printDC() {
    swal({
      title: "Are you sure to print?",
      icon: "warning",
      buttons: [true, true],
      dangerMode: false,
    })
      .then((willsave) => {
        if (willsave) {

          var printContents = document.getElementById('DCTemplate').innerHTML;
          var OrganisationName = 'MICROLABS LIMITED, ' + this.plant;
          var ReportName = "DELIVERY CHALLAN CUM GATE PASS";
          var printedBy = this.currentUser.fullName;
          var now = new Date();
          var jsDate = this.setFormatedDateTime(now);
          var logo = this.userimage;
        //   var htmnikhitml = htmlToPdfmake(`<html>
        // <head>
        // </head>
        // <body>
        // ${printContents}
        // <div>     
        // </div>
        // </body>  
        // </html>`, {
        //     tableAutoSize: true,
        //     headerRows: 1,
        //     dontBreakRows: true,
        //     keepWithHeaderRows: true,
        //   })
          var docDefinition = {
            info: {
              title: 'DC',
            },

            content: [
              //htmnikhitml,
            ],
            defaultStyle: {
              fontSize: 9,
              p: { margin: [10, 15, 10, 20] },
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
                      widths: [70, 350, 70],
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
                      { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + jsDate + '.' + ' This document printed electronically through Unnati v1.0 software' },
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
      });
  }

  
}
