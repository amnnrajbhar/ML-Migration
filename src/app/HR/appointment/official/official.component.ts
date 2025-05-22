import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { NgForm, FormControl } from '@angular/forms';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { APIURLS } from '../../../shared/api-url';
import { AppointmentService } from '../../Services/appointmentService.service';
import { AuthData } from '../../../auth/auth.model';
import { Util } from '../../Services/util.service';
import { OfficialDetails } from './officialDetails.model';
import swal from 'sweetalert';
import { PERMISSIONS } from '../../../shared/permissions';
import { MasterDataService } from '../../Services/masterdata.service';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-appointment-official',
  templateUrl: './official.component.html',
  styleUrls: ['./official.component.css'],
  providers: [AppointmentService, Util]
})
export class OfficialComponent implements OnInit {
  @ViewChild('officialDetailsForm' , { static: false }) private officialDetailsForm: NgForm;
  @Input() appointmentId: number;
  @Input() editAllowed: boolean = true;
  @Output() dataSaved: EventEmitter<any> =   new EventEmitter();
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();
  currentUser: AuthData;
  details:OfficialDetails = {} as OfficialDetails;    
  isLoading: boolean = false;
  titles = [{ type: "Mr." }, { type: "Mrs." }, { type: "Miss." }, { type: "Ms." }, { type: "Dr." }];
  employmentTypes: any[] = [];
  plantList: any[] = [];
  payGroupList: any[] = [];
  employeeCategoryList: any[] = [];
  locationFullList: any[] = [];
  locationList: any[] = [];
  designationList: any[] = [];
  roleList: any[] = [];
  departmentList:any[] = [];
  subDepartmentFullList:any[] = [];
  subDepartmentList:any[] = [];
  countryList: any[] = [];
  stateList: any[] = [];  
  stateFullList: any[] = [];  
  reportingGroupsList:any[] = [];
  addressList: any[] = [];
  managersList: any[] = [];
  pnPeriodList:any[] = [];
  printTemplates:any[] = [];
  signatoryList:any[] = [];  
  submitted = false;
  secondSignatoryRequired = false;
  canAddApprentice = true;
  canAddCompanyRole = true;

  today= new Date();
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private service: AppointmentService, private masterDataService: MasterDataService, private util: Util) { }
    
    
  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));     
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.isLoading = true;
      this.getAllDropDownValues();
      
      //if direct appointment check for permission to select the company role or apprentice
      if(this.appointmentId == null || this.appointmentId == undefined || this.appointmentId <= 0){
        if(this.util.hasPermission(PERMISSIONS.HR_DIRECT_APPOINTMENT_ADD_COMPANY_ROLE)){
          this.employmentTypes.push({type: "Company Role"});
        }
        if(this.util.hasPermission(PERMISSIONS.HR_DIRECT_APPOINTMENT_ADD_APPRENTICE)){
          this.employmentTypes.push({type: "Apprentice"});
        }
      }else{
        this.employmentTypes = [{type: "Company Role"}, {type: "Apprentice"}];
      }
    }
  }

  getAllDropDownValues(){
    this.details.countryId = 100;
    this.getDepartments();
    this.getRole();
    this.getDesignation();
    this.getLocation();
    this.getSubDepartments();
    this.getReportingGroups();
    this.getAddressList();
    this.getProbationNoticePeriods();  
    this.getPlantList();  
    this.masterDataService.getCountries().then((data:any)=>{this.countryList = data;});
    this.masterDataService.getStateAll().then((data:any)=>{this.stateFullList = data; this.loadStateAndLocations();});    
  }
  
  LoadData() {
    // data is loaded on init after drop down values loaded
  }

  getData(){
    this.isLoading = false;
    if(this.appointmentId > 0){
      
      this.isLoading = true;

      this.httpService.HRget(APIURLS.APPOINTMENT_GET_OFFICIAL_DETAILS + "/" + this.appointmentId)
      .then((data: any) => {
        if (data) {
          this.details = data;
          
          if(data.secondSignatoryId > 0){
            this.secondSignatoryRequired = true;
          }
          if(data.countryId==0)
            this.details.countryId = 100;

          if(this.details.printTemplateId == 0)
            this.details.printTemplateId = null;
            
          setTimeout(()=>{
            this.onDesignationChange();  
            this.onDepartmentChange();
          }, 5000);        
          this.onEmpCategoryChange();     
          this.getPayGroupList();
          this.getSignatories();
          this.getPrintTemplates();
          this.loadStateAndLocations();
          if(data != null && data.appointmentOfficialDetailsId > 0)
            this.dataLoaded.emit(data.appointmentOfficialDetailsId);
        }
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        toastr.error("Error occurred while fetching details, please check the link.");
      });
    }
  }

  saveData(){
    if(!this.validate()) return;
    let connection: any;
    this.isLoading = true;
    this.details.appointmentId = this.appointmentId;
    this.details.enteredById = this.currentUser.uid;
    this.details.dateOfJoining = this.util.getFormatedDateTime(this.details.dateOfJoining);
    this.details.secondSignatoryId = this.secondSignatoryRequired == true ? this.details.secondSignatoryId : null;
    if(this.details.dateOfConfirmation != "" && this.details.dateOfConfirmation != null && this.details.dateOfConfirmation != undefined)
      this.details.dateOfConfirmation = this.util.getFormatedDateTime(this.details.dateOfConfirmation);
    else
    {
      toastr.error("Confirmation date is required."); return;
    }
   
      this.details.approvingManagerId = $("#approvingManagerId").val();
      this.details.reportingManagerId = $("#reportingManagerId").val();
      if(!this.details.reportingManagerId || this.details.reportingManagerId <= 0){
        toastr.error("Please select Reporting Manager.");
        return;
      }
      if(!this.details.approvingManagerId || this.details.approvingManagerId <= 0){
        toastr.error("Please select Approving Manager.");
        return;
      }
      if(this.details.printTemplateId == 0 || this.details.printTemplateId == null || this.details.printTemplateId == undefined){
        toastr.error("Please select print template.");
        return;
      }
    connection = this.httpService.HRpost(APIURLS.APPOINTMENT_SAVE_OFFICIAL_DETAILS, this.details);
    
    toastr.info('Saving...');

    connection.then(
      (data: any) => {
        this.isLoading = false;       
        if (data == 200 || data.success) 
        {   
          toastr.success('Details saved successfully!');
            this.dataSaved.emit(data);
        }
        else
        toastr.error(data.message + " Please check all the mandatory fields are entered properly.");
      },
      (err) => {
        this.isLoading = false;
        toastr.error('Error occured while saving the details. Error:' + err);
      })
      .catch(error => {
        this.isLoading = false;
        toastr.error('Error occured while saving the details. Error:' + error);
      });
  }

  validate(){
    this.submitted = true;
    if(!this.officialDetailsForm.form.valid) 
    {
      toastr.error("Please enter all mandatory fields.");       
      return false;
    }
    if(this.details.dateOfConfirmation == "" || this.details.dateOfConfirmation == null || this.details.dateOfConfirmation == undefined)      
    {
      toastr.error("Confirmation date is required."); 
      return false;
    }
    if(new Date(this.details.dateOfJoining) > this.today)
    {
        toastr.error("Joining date cannot be greater than today.");
        return;
    } 
    this.details.approvingManagerId = $("#approvingManagerId").val();
    this.details.reportingManagerId = $("#reportingManagerId").val();
    if(!this.details.reportingManagerId || this.details.reportingManagerId <= 0){
      toastr.error("Please select Reporting Manager.");
      return false;
    }
    if(!this.details.approvingManagerId || this.details.approvingManagerId <= 0){
      toastr.error("Please select Approving Manager.");
      return false;
    }
    if(this.details.printTemplateId == 0 || this.details.printTemplateId == null || this.details.printTemplateId == undefined){
      toastr.error("Please select print template.");
      return false;
    }

    return true;
  }

  getPlantList() {
    this.httpService.HRget(APIURLS.OFFER_GET_PLANTS_ASSIGNED + "/" + this.currentUser.uid).then((data: any) => {
      if (data.length > 0) {
        this.plantList = data.sort((a, b) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
        this.getData();
      }
    }).catch(error => {
      this.plantList = [];
    });2    
  }

  getPayGroupList() {
    this.employeeCategoryList = [];
    if (this.details.plantId > 0) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.details.plantId).then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a, b) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
          this.getEmployeeCategoryList();
          this.getPrintTemplates();
        }
      }).catch(error => {
        this.payGroupList = [];
      });
    }
    else
      this.payGroupList = [];
  }

  getEmployeeCategoryList() {
    if (this.details.plantId > 0 && this.details.payGroupId > 0) {
      this.httpService.HRget(APIURLS.OFFER_GET_EMP_CATEGORIES_ASSIGNED + "/" + this.currentUser.uid + "/" + this.details.plantId + "/" + this.details.payGroupId)
        .then((data: any) => {
          if (data.length > 0) {
            this.employeeCategoryList = data.sort((a, b) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
            this.getSignatories();
            this.getPrintTemplates();
          }
        }).catch(error => {
          this.employeeCategoryList = [];
        });
    }
    else
      this.employeeCategoryList = [];
  }

  getLocation() {
    this.httpService.HRget(APIURLS.OFFER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationFullList = data.sort((a,b)=>{if(a.name > b.name) return 1; if(a.name < b.name) return -1; return 0;});
        this.loadStateAndLocations();
      }
    }).catch(error => {
      this.locationList = [];
    });
  }
  
  getDesignation() {
    this.httpService.HRget(APIURLS.BR_DESIGNATION_HR_API).then((data: any) => {
      if (data.length > 0) {
        this.designationList = data.sort((a,b)=>{if(a.name > b.name) return 1; if(a.name < b.name) return -1; return 0;});        
      }
    }).catch(error => {
      this.designationList = [];
    });
  }
  
  getRole() {
    this.httpService.HRget(APIURLS.OFFER_ROLE_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.roleList = data.sort((a,b)=>{if(a.role_ltxt > b.role_ltxt) return 1; if(a.role_ltxt < b.role_ltxt) return -1; return 0;});
      }
    }).catch(error => {
      this.roleList = [];
    });
  }

  getDepartments(){
    this.httpService.HRget(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.sort((a, b) => { if (a.description > b.description) return 1; if (a.description < b.description) return -1; return 0; });
      }
    }).catch(error => {
      this.departmentList = [];
    });
  }
  
  getSubDepartments(){
    this.httpService.HRget(APIURLS.APPOINTMENT_GET_SUB_DEPARTMENTS).then((data: any) => {
      if (data.length > 0) {
        this.subDepartmentFullList = data.sort((a, b) => { if (a.sdptidLtxt > b.sdptidLtxt) return 1; if (a.sdptidLtxt < b.sdptidLtxt) return -1; return 0; });
      }
    }).catch(error => {
      this.subDepartmentFullList = [];
    });
  }
  
  getReportingGroups(){
    this.httpService.HRget(APIURLS.APPOINTMENT_GET_REPORTING_GROUPS).then((data: any) => {
      if (data.length > 0) {
        this.reportingGroupsList = data.sort((a, b) => { if (a.reportingGroupLt > b.reportingGroupLt) return 1; if (a.reportingGroupLt < b.reportingGroupLt) return -1; return 0; });
      }
    }).catch(error => {
      this.reportingGroupsList = [];
    });
  }
  
  getAddressList(){
    if(this.appointmentId > 0){
      this.httpService.HRget(APIURLS.APPOINTMENT_GET_ADDRESS_LIST+"/"+this.appointmentId).then((data: any) => {
        if (data.length > 0) {
          this.addressList = data.sort((a, b) => { if (a.addressType > b.addressType) return 1; if (a.addressType < b.addressType) return -1; return 0; });
        }
      }).catch(error => {
        this.addressList = [];
      });
    }
  }

  getPrintTemplates(){
    this.printTemplates = [];
    if (this.details.plantId > 0 && this.details.payGroupId > 0 && this.details.employeeCategoryId > 0){
      this.httpService.HRget(APIURLS.APPOINTMENT_GET_PRINT_TEMPLATES+ "/" + this.details.plantId + "/" + this.details.payGroupId +"/"+this.details.employeeCategoryId)
      .then((data: any) => {
        if (data.length > 0) {
          this.printTemplates = data.sort((a, b) => { if (a.templateName > b.templateName) return 1; if (a.templateName < b.templateName) return -1; return 0; });          
        }
      }).catch(error => {
        this.printTemplates = [];
      });
    }
  }
  
  getSignatories(){
    if (this.details.plantId > 0 && this.details.payGroupId > 0 && this.details.employeeCategoryId > 0){
      this.httpService.HRget(APIURLS.APPOINTMENT_GET_SIGNATORIES + "/" + this.details.plantId + "/" + this.details.payGroupId +"/"+this.details.employeeCategoryId)
      .then((data: any) => {
        if (data.length > 0 && this.signatoryList.length == 0) {
          this.signatoryList = data.sort((a, b) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
        }
      }).catch(error => {
        this.signatoryList = [];
      });
    }
  }

  getProbationNoticePeriods(){
    this.httpService.HRget(APIURLS.APPOINTMENT_GET_PROBATION_NOTICE_PERIODS).then((data: any) => {
      if (data.length > 0) {
        this.pnPeriodList = data;
      }
    }).catch(error => {
      this.pnPeriodList = [];
    });
  }

  updateProbationNoticePeriods(){
    if(this.pnPeriodList.length > 0 && this.details.plantId > 0 && this.details.payGroupId > 0 && this.details.employeeCategoryId > 0
      && this.details.departmentId > 0 && this.details.gradeId > 0 ){
    
      var pnDetails = this.pnPeriodList.find(x=>x.plantId == this.details.plantId && 
        x.payGroupId == this.details.payGroupId && x.employeeCategoryId == this.details.employeeCategoryId &&
        x.departmentId == this.details.departmentId && x.gradeId == this.details.gradeId);

      if(pnDetails){
        this.details.probationPeriod = pnDetails.probationPeriod;        
        this.details.noticePeriod = pnDetails.noticePeriod;
        this.calculateDateOfConfirmation();
      }
    }
  }

  calculateDateOfConfirmation(){
    
    if(this.details.probationPeriod >0 && this.details.dateOfJoining ){  
      var dojString = this.details.dateOfJoining.toString();      
      var doj = new Date(dojString);
      console.log('doj',doj)
      doj.setMonth((doj.getMonth()*1) + (this.details.probationPeriod*1));   
      console.log('doj',doj)

      if(doj.getDate()<=15)
        doj.setDate(1);
      else{
        doj.setDate(1);
        doj.setMonth(doj.getMonth()+1);
      }
      //this.details.dateOfConfirmation = doj.toISOString().slice(0, 10);
      this.details.dateOfConfirmation = this.util.getFormatedDateTime(doj);
    }
  }

  lastReportingkeydown = 0;
  getReportingManager($event) {
    let text = $('#reportingManager').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastReportingkeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              if(item.fullName != null)
              return { label: item.fullName + " ("+item.employeeId+")", value: item.id };
            })
            $('#reportingManager').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#reportingManagerId").val(ui.item.value);
                  $("#reportingManager").val(ui.item.label);
                }
                else{
                  $("#reportingManagerId").val('');
                  $("#reportingManager").val('');
                }                  
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#reportingManagerId").val(ui.item.value);
                  $("#reportingManager").val(ui.item.label);
                }
                else{
                  $("#reportingManagerId").val('');
                  $("#reportingManager").val('');
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

  
  lastApprovingkeydown = 0;
  getApprovingManager($event) {
    let text = $('#approvingManager').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastApprovingkeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              if(item.fullName != null)
              return { label: item.fullName + " ("+item.employeeId+")", value: item.id };
            })
            $('#approvingManager').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#approvingManagerId").val(ui.item.value);
                  $("#approvingManager").val(ui.item.label);
                }
                else{
                  $("#approvingManagerId").val('');
                  $("#approvingManager").val('');
                }                  
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#approvingManagerId").val(ui.item.value);
                  $("#approvingManager").val(ui.item.label);
                }
                else{
                  $("#approvingManagerId").val('');
                  $("#approvingManager").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastApprovingkeydown = $event.timeStamp;
    }
  }

  onEmpCategoryChange(){
    if(this.details.employeeCategoryId == 2){   // for FS remove the Apprentice employment type
      this.details.employmentType = "Company Role";
      if(this.employmentTypes.length > 1)
        this.employmentTypes.splice(1,1);
    }
    else{
      if(this.employmentTypes.length == 1)
        this.employmentTypes.push({type: "Apprentice"});
    }
    this.updateProbationNoticePeriods();
    this.getSignatories();
    this.getPrintTemplates();    
  }

  loadStateAndLocations(){
    if(this.details.countryId > 0){
      var country = this.countryList.find(x=>x.id == this.details.countryId);
      this.stateList = this.stateFullList.filter(x => x.land1 == country.land1);
    }   
    var selectedState = this.stateList.find(x=>x.id == this.details.stateId);
    if(selectedState)
      this.locationList = this.locationFullList.filter(x=>x.stateId == selectedState.bland);
  }

  onDepartmentChange(){
    this.subDepartmentList = this.subDepartmentFullList.filter(x=>x.departmentId == this.details.departmentId);
    this.updateProbationNoticePeriods();
  }
  
  onDesignationChange(){
    if(this.designationList.length >0){
      this.details.grade = this.designationList.find(x=>x.id == this.details.designationId).grade;
      this.details.gradeId = this.designationList.find(x=>x.id == this.details.designationId).gradeid;
      this.details.band = this.designationList.find(x=>x.id == this.details.designationId).band;
      this.updateProbationNoticePeriods();
  }
}

onCountryChange(){
  this.stateList = [];    
  this.locationList = [];
  this.details.stateId = "";
  this.details.locationId = "";
  if(this.details.countryId > 0){
    var country = this.countryList.find(x=>x.id == this.details.countryId);
    this.stateList = this.stateFullList.filter(x => x.land1 == country.land1);
  }  
}

onStateChange(){ 
  this.locationList = [];
  this.details.locationId = "";
  var selectedState = this.stateList.find(x=>x.id == this.details.stateId);
  if(selectedState)
    this.locationList = this.locationFullList.filter(x=>x.stateId == selectedState.bland);
    // if(this.details.stateId == 1649)  // Nepal
    // {
    //   this.details.countryId = 160;  // Nepal
    // }
    // else 
    //   this.details.countryId = 100; // India
}

  keyPressAllowOnlyNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 32 && (charCode < 48 || charCode > 57)) {

      return false;
    }
    return true;
  }
}
